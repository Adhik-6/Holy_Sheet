package com.chiggazz.holy_sheets;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

// Standard Plugins
import com.capacitorjs.plugins.app.AppPlugin;
import com.capacitorjs.plugins.network.NetworkPlugin;
import com.capacitorjs.plugins.statusbar.StatusBarPlugin;
import com.capacitorjs.plugins.filesystem.FilesystemPlugin;

// 👇 UPDATE THIS IMPORT
import com.chiggazz.llama.LlamaPlugin; 

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppPlugin.class);
        registerPlugin(NetworkPlugin.class);
        registerPlugin(StatusBarPlugin.class);
        registerPlugin(FilesystemPlugin.class);
        
        // Register Llama
        registerPlugin(LlamaPlugin.class);

        super.onCreate(savedInstanceState);
    }
}