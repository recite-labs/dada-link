package org.recitelabs.dadalink.core.database

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

/**
 * The private log must survive adding the content tables. Builds a real version-1 database from the
 * exported schema (schemas/…/1.json), then opens it with the current Room database: Room runs the
 * auto-migration and validates the resulting schema against version 2 on open.
 */
@RunWith(RobolectricTestRunner::class)
class MigrationTest {
    private val context = ApplicationProvider.getApplicationContext<Context>()

    @Test fun `1 to 2 keeps log entries and adds content tables`() = runTest {
        val file = context.getDatabasePath(DB).apply { parentFile?.mkdirs(); delete() }
        val v1 = JSONObject(requireNotNull(javaClass.getResource("/$SCHEMA_DIR/1.json")).readText()).getJSONObject("database")
        SQLiteDatabase.openOrCreateDatabase(file, null).use { db ->
            val entities = v1.getJSONArray("entities")
            for (i in 0 until entities.length()) {
                val entity = entities.getJSONObject(i)
                val table = entity.getString("tableName")
                db.execSQL(entity.getString("createSql").replace("\${TABLE_NAME}", table))
                entity.optJSONArray("indices")?.let { indices ->
                    for (j in 0 until indices.length()) db.execSQL(indices.getJSONObject(j).getString("createSql").replace("\${TABLE_NAME}", table))
                }
            }
            val setup = v1.getJSONArray("setupQueries")
            for (i in 0 until setup.length()) db.execSQL(setup.getString(i))
            db.execSQL("INSERT INTO log_entries (kind, date, note, photo_ids) VALUES ('incident', 20000, 'kept', '')")
            db.version = 1
        }

        val room = Room.databaseBuilder(context, DadaDatabase::class.java, DB).allowMainThreadQueries().build()
        try {
            assertEquals(listOf("kept"), room.logEntryDao().observeAll().first().map { it.note })
            assertEquals(emptyList<String>(), room.contentDao().directoryCountries())
        } finally {
            room.close()
        }
    }

    private companion object {
        const val DB = "migration-test.db"
        const val SCHEMA_DIR = "org.recitelabs.dadalink.core.database.DadaDatabase"
    }
}
