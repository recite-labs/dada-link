package org.recitelabs.dadalink.core.network.di

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.ApiBaseUrl
import org.recitelabs.dadalink.core.network.AssistantApi
import org.recitelabs.dadalink.core.network.BuildConfig
import org.recitelabs.dadalink.core.network.KtorAssistantApi
import org.recitelabs.dadalink.core.network.KtorSosApi
import org.recitelabs.dadalink.core.network.SosApi
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class NetworkModule {
    @Binds abstract fun assistantApi(impl: KtorAssistantApi): AssistantApi

    @Binds abstract fun sosApi(impl: KtorSosApi): SosApi

    companion object {
        @Provides
        @Singleton
        fun json(): Json = Json { ignoreUnknownKeys = true; explicitNulls = false }

        @Provides
        fun baseUrl(): ApiBaseUrl = ApiBaseUrl(BuildConfig.API_BASE_URL)

        /** No logging plugin on purpose: requests may contain private messages and locations. */
        @Provides
        @Singleton
        fun httpClient(json: Json): HttpClient = HttpClient(OkHttp) {
            expectSuccess = false
            install(ContentNegotiation) { json(json) }
            install(HttpTimeout) {
                connectTimeoutMillis = 15_000
                requestTimeoutMillis = 120_000
                socketTimeoutMillis = 60_000
            }
            defaultRequest { headers.append(HttpHeaders.UserAgent, "DadaLink-Android") }
        }
    }
}
