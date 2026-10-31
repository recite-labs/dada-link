package org.recitelabs.dadalink.core.data

import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.core.data.repository.toModel
import org.recitelabs.dadalink.core.datastore.StoredContact
import org.recitelabs.dadalink.core.datastore.StoredPin
import org.recitelabs.dadalink.core.datastore.StoredSettings
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.model.UserSettings

class SettingsMappingTest {
    @Test fun `defaults map to safe defaults`() = assertEquals(UserSettings(), StoredSettings().toModel())

    @Test fun `maps stored values and tolerates unknown enums`() {
        val model = StoredSettings(
            onboarded = true, languageTag = "am", countryIso = "LB", disguise = "CALCULATOR",
            contact = StoredContact("Almaz", "Sister", "+251911000000"), pin = StoredPin("s", "h", 1),
        ).toModel()
        assertEquals(AppLanguage.AMHARIC, model.language)
        assertEquals(Country.LEBANON, model.country)
        assertEquals(DisguiseMode.CALCULATOR, model.disguise)
        assertEquals(TrustedContact("Almaz", "Sister", "+251911000000", null), model.trustedContact)
        assertEquals(true, model.hasPin)
        assertEquals(DisguiseMode.NONE, StoredSettings(disguise = "SPACESHIP").toModel().disguise)
    }
}
