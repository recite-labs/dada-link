package org.recitelabs.dadalink.core.data.repository

import dagger.Lazy
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import org.recitelabs.dadalink.core.common.DadaDispatchers
import org.recitelabs.dadalink.core.common.Dispatcher
import org.recitelabs.dadalink.core.data.wireLocale
import org.recitelabs.dadalink.core.database.DadaDatabase
import org.recitelabs.dadalink.core.database.dao.ContentDao
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpDirectory
import javax.inject.Inject

/**
 * Reads what [org.recitelabs.dadalink.core.data.sync.ContentSyncer] stored in the encrypted
 * database, falling back to the bundled sample until a sync has succeeded — and whenever the
 * database cannot be opened. Help numbers therefore never depend on the network or on the DB.
 */
class OfflineFirstContentRepository @Inject constructor(
    private val database: Lazy<DadaDatabase>,
    private val bundled: BundledContentRepository,
    @Dispatcher(DadaDispatchers.IO) private val io: CoroutineDispatcher,
) : ContentRepository {

    private suspend fun dao(): ContentDao? = withContext(io) {
        try {
            database.get().contentDao()
        } catch (e: CancellationException) {
            throw e
        } catch (_: Throwable) {
            null // Keystore/SQLCipher failure (incl. native UnsatisfiedLinkError): the bundle still has numbers.
        }
    }

    /** Runs [block] on the synced store; null when nothing is synced yet or the store failed. */
    private suspend fun <T : Any> synced(block: suspend (ContentDao) -> T?): T? {
        val dao = dao() ?: return null
        return try {
            withContext(io) { block(dao) }
        } catch (e: CancellationException) {
            throw e
        } catch (_: Throwable) {
            null
        }
    }

    override suspend fun helpDirectory(country: Country, language: AppLanguage): HelpDirectory? =
        synced { SyncedContentMapper.directory(country, it.directory(country.isoCode), language) }
            ?: bundled.helpDirectory(country, language)

    @OptIn(ExperimentalCoroutinesApi::class)
    override fun observeHelpDirectory(country: Country, language: AppLanguage): Flow<HelpDirectory?> =
        flow { emit(dao()) }
            .flatMapLatest { dao ->
                dao?.observeDirectory(country.isoCode)?.map { SyncedContentMapper.directory(country, it, language) }
                    ?: flowOf(null)
            }
            .map { it ?: bundled.helpDirectory(country, language) }
            .catch { emit(bundled.helpDirectory(country, language)) }
            .distinctUntilChanged()
            .flowOn(io)

    override suspend fun countriesWithDirectory(): List<Country> {
        val available = synced { it.directoryCountries() }.orEmpty().toSet() + bundled.countriesWithDirectory().map { it.isoCode }
        return Country.entries.filter { it.isoCode in available }
    }

    override suspend fun articles(category: ArticleCategory, country: Country?, language: AppLanguage): List<Article> {
        val items = synced { dao -> dao.content(language.wireLocale).takeIf { it.isNotEmpty() } }
            ?: return bundled.articles(category, country, language)
        return items
            .filter { category in SyncedContentMapper.categoriesOf(it) && SyncedContentMapper.appliesTo(it, country) }
            .map { SyncedContentMapper.article(it, category) }
    }

    override suspend fun article(id: String, language: AppLanguage): Article? =
        synced { it.contentItem(id, language.wireLocale) }?.let { SyncedContentMapper.article(it) }
            ?: bundled.article(id, language)

    override suspend fun licensedAgencies(): List<Agency> = bundled.licensedAgencies()
}
