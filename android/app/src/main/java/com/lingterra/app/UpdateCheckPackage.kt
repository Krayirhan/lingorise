package com.lingterra.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.UpdateAvailability

class UpdateCheckPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(UpdateCheckModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class UpdateCheckModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "LingterraUpdateCheck"

  @ReactMethod
  fun isUpdateAvailable(promise: Promise) {
    try {
      AppUpdateManagerFactory.create(context).appUpdateInfo
        .addOnSuccessListener { promise.resolve(it.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) }
        .addOnFailureListener { promise.resolve(false) }
    } catch (_: Exception) {
      promise.resolve(false)
    }
  }
}
