package org.recitelabs.dadalink.core.common

import javax.inject.Qualifier

enum class DadaDispatchers { Default, IO }

@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class Dispatcher(val dispatcher: DadaDispatchers)

/** Process-wide scope for work that must outlive a screen (e.g. sending an SOS). */
@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class ApplicationScope
