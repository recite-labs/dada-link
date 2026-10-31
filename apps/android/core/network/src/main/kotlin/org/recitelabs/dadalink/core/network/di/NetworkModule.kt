package org.recitelabs.dadalink.core.network.di

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.defaultRequest
import io.ktor.http.HttpHeaders
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.AgencyApi
import org.recitelabs.dadalink.core.network.ApiBaseUrl
import org.recitelabs.dadalink.core.network.AssistantApi
import org.recitelabs.dadalink.core.network.BuildConfig
import org.recitelabs.dadalink.core.network.ContentApi
import org.recitelabs.dadalink.core.network.HealthApi
import org.recitelabs.dadalink.core.network.KtorAgencyApi
import org.recitelabs.dadalink.core.network.KtorAssistantApi
import org.recitelabs.dadalink.core.network.KtorContentApi
import org.recitelabs.dadalink.core.network.KtorHealthApi
import org.recitelabs.dadalink.core.network.KtorSosApi
import org.recitelabs.dadalink.core.network.SosApi
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class NetworkModule {
    @Binds abstract fun assistantApi(impl: KtorAssistantApi): AssistantApi

    @Binds abstract fun sosApi(impl: KtorSosApi): SosApi

    @Binds abstract fun contentApi(impl: KtorContentApi): ContentApi

    @Binds abstract fun agencyApi(impl: KtorAgencyApi): AgencyApi

    @Binds abstract fun healthApi(impl: KtorHealthApi): HealthApi

    companion object {
        @Provides
        @Singleton
        fun json(): Json = DadaJson

        @Provides
        fun baseUrl(): ApiBaseUrl = ApiBaseUrl(BuildConfig.API_BASE_URL)

        /**
         * No logging plugin and no cookies on purpose: requests may contain private questions and
         * locations. The only identifier ever sent is the random install UUID used for quotas.
         */
        @Provides
        @Singleton
        fun httpClient(): HttpClient = HttpClient(OkHttp) {
            expectSuccess = false
            install(HttpTimeout) {
                connectTimeoutMillis = 15_000
                requestTimeoutMillis = 120_000
                socketTimeoutMillis = 60_000
            }
            defaultRequest { headers.append(HttpHeaders.UserAgent, "DadaLink-Android") }
        }
    }
}

/** Lenient on input (new optional fields), strict on output (optional keys omitted, never `null`). */
val DadaJson: Json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
}
