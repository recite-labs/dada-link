package org.recitelabs.dadalink.core.database

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.database.model.asEntity
import org.recitelabs.dadalink.core.database.model.asExternalModel
import org.recitelabs.dadalink.core.model.LogEntry
import org.robolectric.RobolectricTestRunner
import java.time.LocalDate

/** Schema + mapping test on an in-memory database (SQLCipher's native lib is device-only). */
@RunWith(RobolectricTestRunner::class)
class LogEntryDaoTest {
    private val db = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext<Context>(), DadaDatabase::class.java)
        .allowMainThreadQueries()
        .build()
    private val dao = db.logEntryDao()

    @After fun close() = db.close()

    @Test fun `stores every entry kind and returns newest first`() = runTest {
        val wage = LogEntry.Wage(date = LocalDate.of(2026, 9, 30), note = "September", expected = 1000, received = 0, currency = "SAR")
        val hours = LogEntry.Hours(date = LocalDate.of(2026, 10, 2), hoursWorked = 16.5, hadRestDay = false)
        val incident = LogEntry.Incident(date = LocalDate.of(2026, 10, 3), note = "Shouted at", photoIds = listOf("a", "b"))

        val ids = listOf(wage, hours, incident).map { dao.insert(it.asEntity()) }

        dao.observeAll().test {
            val stored = awaitItem().map { it.asExternalModel() }
            assertEquals(
                listOf(incident.copy(id = ids[2]), hours.copy(id = ids[1]), wage.copy(id = ids[0])),
                stored,
            )
        }
    }

    @Test fun `deletes by id`() = runTest {
        val id = dao.insert(LogEntry.Incident(date = LocalDate.of(2026, 10, 3), note = "x").asEntity())
        dao.delete(id)
        dao.observeAll().test { assertEquals(emptyList<Any>(), awaitItem()) }
    }
}
