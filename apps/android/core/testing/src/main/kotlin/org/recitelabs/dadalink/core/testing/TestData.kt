package org.recitelabs.dadalink.core.testing

import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AgencyStatus
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.GeoPoint
import org.recitelabs.dadalink.core.model.HelpContact
import org.recitelabs.dadalink.core.model.HelpDirectory
import org.recitelabs.dadalink.core.model.HelpSection
import org.recitelabs.dadalink.core.model.TrustedContact

/** Sample data for tests and previews only (Meron in Riyadh, her sister Almaz). */
object TestData {
    val almaz = TrustedContact(name = "Almaz", relation = "Sister", phone = "+251911000000", telegram = "@almaz_t")

    val riyadh = GeoPoint(latitude = 24.7136, longitude = 46.6753, accuracyMeters = 18f)

    val saudiDirectory = HelpDirectory(
        country = Country.SAUDI_ARABIA,
        emergency = HelpContact("emergency", "Emergency", "Police, ambulance, fire", "911", "24/7", verified = true),
        sections = listOf(
            HelpSection(
                "Embassy",
                listOf(HelpContact("embassy-riyadh", "Ethiopian Embassy, Riyadh", "Consular help", null, null, verified = false)),
            ),
            HelpSection(
                "Work problems",
                listOf(HelpContact("labour", "Labour complaints", "Ministry of Human Resources", "19911", "24/7", verified = true)),
            ),
        ),
        lastReviewed = "2026-10",
    )

    val rightsArticle = Article(
        id = "rights-sa-passport",
        category = ArticleCategory.RIGHTS,
        country = Country.SAUDI_ARABIA,
        title = "Your passport is yours",
        summary = "Employers may not keep your passport.",
        body = "Body",
        reviewedBy = null,
        isDraft = true,
    )

    val licensedAgency = Agency("Selam Foreign Employment Agent PLC", "MoLS/123/2024", AgencyStatus.LICENSED, "Addis Ababa")
}
