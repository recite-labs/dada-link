package org.recitelabs.dadalink.feature.disguise

import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.feature.disguise.calculator.CalcKey
import org.recitelabs.dadalink.feature.disguise.calculator.CalculatorEngine
import org.recitelabs.dadalink.feature.disguise.calculator.CalculatorState
import org.recitelabs.dadalink.feature.disguise.calculator.Operator

class CalculatorEngineTest {
    private fun type(keys: String): CalculatorState = keys.fold(CalculatorState()) { s, c ->
        val key = when (c) {
            in '0'..'9' -> CalcKey.Digit(c - '0')
            '.' -> CalcKey.Dot
            '+' -> CalcKey.Op(Operator.ADD)
            '-' -> CalcKey.Op(Operator.SUBTRACT)
            '*' -> CalcKey.Op(Operator.MULTIPLY)
            '/' -> CalcKey.Op(Operator.DIVIDE)
            '=' -> CalcKey.Equals
            'C' -> CalcKey.Clear
            '<' -> CalcKey.Delete
            '%' -> CalcKey.Percent
            else -> error("bad key $c")
        }
        CalculatorEngine.press(s, key)
    }

    @Test fun `basic arithmetic`() {
        assertEquals("5", type("2+3=").display)
        assertEquals("-1", type("2-3=").display)
        assertEquals("6.25", type("2.5*2.5=").display)
        assertEquals("0.333333333333", type("1/3=").display)
    }

    @Test fun `chains left to right`() = assertEquals("20", type("2+3*4=").display)

    @Test fun `changing operator keeps the last one`() = assertEquals("6", type("2+*3=").display)

    @Test fun `divide by zero is an error and any key recovers`() {
        assertEquals("Error", type("5/0=").display)
        assertEquals("7", type("5/0=7").display)
    }

    @Test fun `delete, clear, percent and leading zeros`() {
        assertEquals("12", type("123<").display)
        assertEquals("0", type("12C").display)
        assertEquals("0.5", type("50%").display)
        assertEquals("7", type("007").display)
        assertEquals("0.5", type(".5").display)
    }

    @Test fun `tracks digits typed since the last operator for the PIN gesture`() {
        assertEquals("2071", type("2071").typedDigits)
        assertEquals("71", type("20+71").typedDigits)
        assertEquals("", type("2071=").typedDigits)
    }
}
