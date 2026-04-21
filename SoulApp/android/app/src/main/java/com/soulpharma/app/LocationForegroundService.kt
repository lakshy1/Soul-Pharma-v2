package com.soulpharma.app

import android.app.*
import android.content.Intent
import android.content.SharedPreferences
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class LocationForegroundService : Service() {

    companion object {
        const val ACTION_START         = "com.soulpharma.app.START"
        const val ACTION_STOP          = "com.soulpharma.app.STOP"
        const val ACTION_UPDATE_NOTIF  = "com.soulpharma.app.UPDATE_NOTIF"

        const val CHANNEL_ID           = "soul_tracker_channel"
        const val NOTIF_ID             = 1001
        const val TAG                  = "SoulTracker"
        const val API_BASE             = "https://soul-pharma-v2.onrender.com/api"
        const val PREFS_NAME           = "CapacitorStorage"   // Capacitor Preferences shared prefs

        @Volatile var isRunning        = false
    }

    // ── State ──────────────────────────────────────────────────────────────────
    private lateinit var fusedClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private lateinit var prefs: SharedPreferences

    private var token   = ""
    private var empId   = ""
    private var empName = ""
    private var notifMsg = "Soul Pharma — location tracking active"

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // ── Lifecycle ──────────────────────────────────────────────────────────────
    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        fusedClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                token   = intent.getStringExtra("token")   ?: prefs.getString("token", "") ?: ""
                empId   = intent.getStringExtra("empId")   ?: prefs.getString("empId", "") ?: ""
                empName = intent.getStringExtra("empName") ?: prefs.getString("empName", "") ?: ""

                startForeground(NOTIF_ID, buildNotification(notifMsg))
                isRunning = true
                startLocationUpdates()
                Log.i(TAG, "Service started for $empName ($empId)")
            }

            ACTION_STOP -> {
                stopSelf()
            }

            ACTION_UPDATE_NOTIF -> {
                notifMsg = intent.getStringExtra("message") ?: notifMsg
                val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
                nm.notify(NOTIF_ID, buildNotification(notifMsg))
            }
        }

        return START_STICKY    // Restart if killed by OS
    }

    override fun onDestroy() {
        isRunning = false
        fusedClient.removeLocationUpdates(locationCallback)
        serviceScope.cancel()
        Log.i(TAG, "Service destroyed")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ── Location ───────────────────────────────────────────────────────────────
    private fun startLocationUpdates() {
        val request = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            5 * 60 * 1000L  // every 5 minutes
        ).apply {
            setMinUpdateIntervalMillis(2 * 60 * 1000L)
            setWaitForAccurateLocation(false)
        }.build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val loc = result.lastLocation ?: return
                Log.d(TAG, "Location: ${loc.latitude}, ${loc.longitude}")
                sendLocationToServer(loc)
            }
        }

        try {
            fusedClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permission missing: ${e.message}")
        }
    }

    // ── API ────────────────────────────────────────────────────────────────────
    private fun sendLocationToServer(loc: Location) {
        // Refresh token from prefs in case it was updated by WebView
        val currentToken = prefs.getString("token", token) ?: token
        if (currentToken.isBlank()) {
            Log.w(TAG, "No auth token — skipping location push")
            return
        }

        serviceScope.launch {
            try {
                val body = JSONObject().apply {
                    put("latitude",  loc.latitude)
                    put("longitude", loc.longitude)
                    put("accuracy",  loc.accuracy)
                    put("timestamp", System.currentTimeMillis())
                }.toString()

                val url = URL("$API_BASE/employee/location")
                val conn = url.openConnection() as HttpURLConnection
                conn.apply {
                    requestMethod = "POST"
                    setRequestProperty("Content-Type",  "application/json")
                    setRequestProperty("Authorization", "Bearer $currentToken")
                    doOutput = true
                    connectTimeout = 15_000
                    readTimeout    = 15_000
                    outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
                }

                val code = conn.responseCode
                Log.i(TAG, "Location pushed — HTTP $code")
                conn.disconnect()

                // Update notification with last-seen time
                val time = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
                    .format(java.util.Date())
                val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
                nm.notify(NOTIF_ID, buildNotification("Last synced at $time"))

            } catch (e: Exception) {
                Log.e(TAG, "Location push failed: ${e.message}")
            }
        }
    }

    // ── Notification helpers ───────────────────────────────────────────────────
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Soul Pharma Tracker",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps Soul Pharma running in background"
                setShowBadge(false)
            }
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }
    }

    private fun buildNotification(message: String): Notification {
        val openIntent = PendingIntent.getActivity(
            this, 0,
            packageManager.getLaunchIntentForPackage(packageName),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Soul Pharma")
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_stat_soul)    // add this drawable to res/drawable
            .setContentIntent(openIntent)
            .setOngoing(true)
            .setShowWhen(false)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }
}
