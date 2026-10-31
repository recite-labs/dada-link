package org.recitelabs.dadalink.feature.disguise.calculator

import java.math.BigDecimal
import java.math.MathContext
import java.math.RoundingMode

enum class Operator(val symbol: String) { ADD("+"), SUBTRACT("−"), MULTIPLY("×"), DIVIDE("÷") }

sealed interface CalcKey {
    data class Digit(val value: Int) : CalcKey
    data class Op(val operator: Operator) : CalcKey
    data object Dot : CalcKey
    data object Equals : CalcKey
    data object Clear : CalcKey
    data object Delete : CalcKey
    data object Percent : CalcKey
}

/** Immutable calculator state. [entry] is what is being typed; [accumulator] the left operand. */
data class CalculatorState(
    val entry: String = "0",
    val accumulator: BigDecimal? = null,
    val pending: Operator? = null,
    /** The next digit starts a new number (after an operator or "="). */
    val startNew: Boolean = false,
    val isError: Boolean = false,
    /** Digits typed since the last operator/clear/equals, used for the PIN gesture. */
    val typedDigits: String = "",
) {
    val display: String get() = if (isError) "Error" else entry
    val expression: String get() = if (accumulator != null && pending != null) "${CalculatorEngine.format(accumulator)} ${pending.symbol}" else ""
}

/** A real, working four-function calculator — the disguise must survive being used. */
object CalculatorEngine {
    private const val MAX_DIGITS = 12
    private val context = MathContext(MAX_DIGITS, RoundingMode.HALF_UP)

    fun press(state: CalculatorState, key: CalcKey): CalculatorState {
        if (state.isError && key != CalcKey.Clear) return press(CalculatorState(), key)
        return when (key) {
            is CalcKey.Digit -> digit(state, key.value)
            CalcKey.Dot -> dot(state)
            is CalcKey.Op -> operator(state, key.operator)
            CalcKey.Equals -> equals(state)
            CalcKey.Clear -> CalculatorState()
            CalcKey.Delete -> delete(state)
            CalcKey.Percent -> state.copy(entry = format(state.value().divide(BigDecimal(100), context)), startNew = true, typedDigits = "")
        }
    }

    private fun digit(state: CalculatorState, d: Int): CalculatorState {
        val base = if (state.startNew) "0" else state.entry
        if (base.count(Char::isDigit) >= MAX_DIGITS) return state
        val entry = if (base == "0") d.toString() else base + d
        val typed = (if (state.startNew) "" else state.typedDigits) + d
        return state.copy(entry = entry, startNew = false, typedDigits = typed)
    }

    private fun dot(state: CalculatorState): CalculatorState {
        if (state.startNew) return state.copy(entry = "0.", startNew = false, typedDigits = "")
        if ('.' in state.entry) return state
        return state.copy(entry = state.entry + ".", typedDigits = "")
    }

    private fun delete(state: CalculatorState): CalculatorState {
        if (state.startNew) return state
        val entry = state.entry.dropLast(1).ifEmpty { "0" }.let { if (it == "-") "0" else it }
        return state.copy(entry = entry, typedDigits = state.typedDigits.dropLast(1))
    }

    private fun operator(state: CalculatorState, op: Operator): CalculatorState {
        // Changing the operator right after choosing one.
        if (state.pending != null && state.startNew) return state.copy(pending = op, typedDigits = "")
        val left = if (state.accumulator != null && state.pending != null) {
            compute(state.accumulator, state.pending, state.value()) ?: return CalculatorState(isError = true)
        } else {
            state.value()
        }
        return state.copy(entry = format(left), accumulator = left, pending = op, startNew = true, typedDigits = "")
    }

    private fun equals(state: CalculatorState): CalculatorState {
        val acc = state.accumulator
        val op = state.pending ?: return state.copy(startNew = true, typedDigits = "")
        val result = compute(acc ?: BigDecimal.ZERO, op, state.value()) ?: return CalculatorState(isError = true)
        return CalculatorState(entry = format(result), startNew = true)
    }

    private fun compute(left: BigDecimal, op: Operator, right: BigDecimal): BigDecimal? = when (op) {
        Operator.ADD -> left.add(right, context)
        Operator.SUBTRACT -> left.subtract(right, context)
        Operator.MULTIPLY -> left.multiply(right, context)
        Operator.DIVIDE -> if (right.signum() == 0) null else left.divide(right, context)
    }

    private fun CalculatorState.value(): BigDecimal = entry.toBigDecimalOrNull() ?: BigDecimal.ZERO

    fun format(value: BigDecimal): String {
        val rounded = value.round(context).stripTrailingZeros()
        val plain = rounded.toPlainString()
        return if (plain.count(Char::isDigit) > MAX_DIGITS) rounded.toString() else plain
    }
}
