package com.soulpharma.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(SoulTrackerPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
