package org.recitelabs.dadalink.core.data.di

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import org.recitelabs.dadalink.core.data.BuildConfig
import org.recitelabs.dadalink.core.data.assistant.FakeAssistant
import org.recitelabs.dadalink.core.data.assistant.RemoteAssistantRepository
import org.recitelabs.dadalink.core.data.platform.LauncherDisguiseController
import org.recitelabs.dadalink.core.data.repository.DefaultPinRepository
import org.recitelabs.dadalink.core.data.repository.DefaultSettingsRepository
import org.recitelabs.dadalink.core.data.repository.InMemorySessionLock
import org.recitelabs.dadalink.core.data.repository.OfflineContentRepository
import org.recitelabs.dadalink.core.data.repository.RoomPrivateLogRepository
import org.recitelabs.dadalink.core.data.sos.AndroidLocationProvider
import org.recitelabs.dadalink.core.data.sos.AndroidSmsGateway
import org.recitelabs.dadalink.core.data.sos.PreviewSosRelay
import org.recitelabs.dadalink.core.data.sos.RemoteSosRelay
import org.recitelabs.dadalink.core.domain.repository.AssistantRepository
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.domain.repository.DisguiseController
import org.recitelabs.dadalink.core.domain.repository.LocationProvider
import org.recitelabs.dadalink.core.domain.repository.PinRepository
import org.recitelabs.dadalink.core.domain.repository.PrivateLogRepository
import org.recitelabs.dadalink.core.domain.repository.SessionLock
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.repository.SmsGateway
import org.recitelabs.dadalink.core.domain.repository.SosRelay
import javax.inject.Provider

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds abstract fun settings(impl: DefaultSettingsRepository): SettingsRepository
    @Binds abstract fun pins(impl: DefaultPinRepository): PinRepository
    @Binds abstract fun sessionLock(impl: InMemorySessionLock): SessionLock
    @Binds abstract fun content(impl: OfflineContentRepository): ContentRepository
    @Binds abstract fun privateLog(impl: RoomPrivateLogRepository): PrivateLogRepository
    @Binds abstract fun disguise(impl: LauncherDisguiseController): DisguiseController
    @Binds abstract fun sms(impl: AndroidSmsGateway): SmsGateway
    @Binds abstract fun location(impl: AndroidLocationProvider): LocationProvider

    companion object {
        /** `-Pdadalink.useFakeBackend=false` switches to the real API once it exists. */
        @Provides
        fun assistant(fake: Provider<FakeAssistant>, remote: Provider<RemoteAssistantRepository>): AssistantRepository =
            if (BuildConfig.USE_FAKE_BACKEND) fake.get() else remote.get()

        @Provides
        fun sosRelay(preview: Provider<PreviewSosRelay>, remote: Provider<RemoteSosRelay>): SosRelay =
            if (BuildConfig.USE_FAKE_BACKEND) preview.get() else remote.get()
    }
}
