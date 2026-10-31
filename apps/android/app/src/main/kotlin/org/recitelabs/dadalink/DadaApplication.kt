package org.recitelabs.dadalink

import android.app.Application
import android.os.SystemClock
import androidx.hilt.work.HiltWorkerFactory
import androidx.lifecycle.ProcessLifecycleOwner
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import org.recitelabs.dadalink.core.domain.repository.SessionLock
import org.recitelabs.dadalink.lifecycle.AutoLock
import javax.inject.Inject

/** No analytics, crash reporting or ad SDKs are initialised here — by design. */
@HiltAndroidApp
class DadaApplication : Application(), Configuration.Provider {
    @Inject lateinit var workerFactory: HiltWorkerFactory

    @Inject lateinit var sessionLock: SessionLock

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .setMinimumLoggingLevel(android.util.Log.ERROR)
            .build()

    override fun onCreate() {
        super.onCreate()
        ProcessLifecycleOwner.get().lifecycle.addObserver(AutoLock(sessionLock, SystemClock::elapsedRealtime))
    }
}
