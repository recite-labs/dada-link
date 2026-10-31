package org.recitelabs.dadalink.core.data.di

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import org.recitelabs.dadalink.core.data.BuildConfig
import org.recitelabs.dadalink.core.data.agency.BundledAgencyRepository
import org.recitelabs.dadalink.core.data.agency.RemoteAgencyRepository
import org.recitelabs.dadalink.core.data.assistant.FakeAssistant
import org.recitelabs.dadalink.core.data.assistant.RemoteAssistantRepository
import org.recitelabs.dadalink.core.data.platform.LauncherDisguiseController
import org.recitelabs.dadalink.core.data.repository.DefaultPinRepository
import org.recitelabs.dadalink.core.data.repository.DefaultSettingsRepository
import org.recitelabs.dadalink.core.data.repository.InMemorySessionLock
import org.recitelabs.dadalink.core.data.repository.BundledContentRepository
import org.recitelabs.dadalink.core.data.repository.OfflineFirstContentRepository
import org.recitelabs.dadalink.core.data.repository.RoomPrivateLogRepository
import org.recitelabs.dadalink.core.data.sos.AndroidLocationProvider
import org.recitelabs.dadalink.core.data.sos.AndroidSmsGateway
import org.recitelabs.dadalink.core.data.sos.PreviewSosRelay
import org.recitelabs.dadalink.core.data.sos.RemoteSosRelay
import org.recitelabs.dadalink.core.domain.repository.AgencyRepository
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
    @Binds abstract fun privateLog(impl: RoomPrivateLogRepository): PrivateLogRepository
    @Binds abstract fun disguise(impl: LauncherDisguiseController): DisguiseController
    @Binds abstract fun sms(impl: AndroidSmsGateway): SmsGateway
    @Binds abstract fun location(impl: AndroidLocationProvider): LocationProvider

    companion object {
        /*
         * The real API is the default. `-Pdadalink.useFakeBackend=true` swaps in offline fakes:
         * canned assistant, a relay that reports failure, bundled content only (no sync).
         */
        @Provides
        fun content(bundled: Provider<BundledContentRepository>, offlineFirst: Provider<OfflineFirstContentRepository>): ContentRepository =
            if (BuildConfig.USE_FAKE_BACKEND) bundled.get() else offlineFirst.get()

        @Provides
        fun agencies(bundled: Provider<BundledAgencyRepository>, remote: Provider<RemoteAgencyRepository>): AgencyRepository =
            if (BuildConfig.USE_FAKE_BACKEND) bundled.get() else remote.get()

        @Provides
        fun assistant(fake: Provider<FakeAssistant>, remote: Provider<RemoteAssistantRepository>): AssistantRepository =
            if (BuildConfig.USE_FAKE_BACKEND) fake.get() else remote.get()

        @Provides
        fun sosRelay(preview: Provider<PreviewSosRelay>, remote: Provider<RemoteSosRelay>): SosRelay =
            if (BuildConfig.USE_FAKE_BACKEND) preview.get() else remote.get()
    }
}
