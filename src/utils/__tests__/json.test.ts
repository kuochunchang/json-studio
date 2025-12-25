/**
 * Unit tests for JSON utility functions
 * Following Guideline 8.2 - Utils should have 100% coverage
 */
import { describe, expect, it } from 'vitest'
import { formatJson, getJsonSize, isValidJson, minifyJson, safeParseJson } from '../json'

describe('formatJson', () => {
    it('should format valid JSON with default indent', () => {
        const input = '{"name":"test","value":123}'
        const result = formatJson(input)
        expect(result).toBe('{\n  "name": "test",\n  "value": 123\n}')
    })

    it('should format valid JSON with custom indent', () => {
        const input = '{"a":1}'
        const result = formatJson(input, 4)
        expect(result).toBe('{\n    "a": 1\n}')
    })

    it('should return null for invalid JSON', () => {
        const input = 'not valid json'
        const result = formatJson(input)
        expect(result).toBeNull()
    })

    it('should handle empty object', () => {
        const input = '{}'
        const result = formatJson(input)
        expect(result).toBe('{}')
    })

    it('should handle nested objects', () => {
        const input = '{"outer":{"inner":true}}'
        const result = formatJson(input)
        expect(result).toContain('"outer"')
        expect(result).toContain('"inner"')
    })
})

describe('minifyJson', () => {
    it('should minify formatted JSON', () => {
        const input = '{\n  "name": "test",\n  "value": 123\n}'
        const result = minifyJson(input)
        expect(result).toBe('{"name":"test","value":123}')
    })

    it('should return null for invalid JSON', () => {
        const input = 'not valid json'
        const result = minifyJson(input)
        expect(result).toBeNull()
    })

    it('should handle already minified JSON', () => {
        const input = '{"a":1}'
        const result = minifyJson(input)
        expect(result).toBe('{"a":1}')
    })
})

describe('isValidJson', () => {
    it('should return true for valid JSON object', () => {
        expect(isValidJson('{"key": "value"}')).toBe(true)
    })

    it('should return true for valid JSON array', () => {
        expect(isValidJson('[1, 2, 3]')).toBe(true)
    })

    it('should return true for valid JSON primitive', () => {
        expect(isValidJson('"string"')).toBe(true)
        expect(isValidJson('123')).toBe(true)
        expect(isValidJson('true')).toBe(true)
        expect(isValidJson('null')).toBe(true)
    })

    it('should return false for invalid JSON', () => {
        expect(isValidJson('not json')).toBe(false)
        expect(isValidJson('{key: value}')).toBe(false)
        expect(isValidJson('')).toBe(false)
    })
})

describe('getJsonSize', () => {
    it('should return correct byte size for ASCII string', () => {
        const input = '{"a":1}'
        // Each character is 1 byte for ASCII
        expect(getJsonSize(input)).toBe(7)
    })

    it('should return correct byte size for empty string', () => {
        expect(getJsonSize('')).toBe(0)
    })

    it('should handle unicode characters', () => {
        const input = '{"emoji":"😀"}'
        // Unicode emoji takes multiple bytes
        expect(getJsonSize(input)).toBeGreaterThan(input.length)
    })
})

describe('safeParseJson', () => {
    it('should return success with parsed data for valid JSON', () => {
        const result = safeParseJson<{ name: string }>('{"name": "test"}')
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.name).toBe('test')
        }
    })

    it('should return failure with error message for invalid JSON', () => {
        const result = safeParseJson('not valid')
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error).toBeTruthy()
        }
    })

    it('should handle arrays', () => {
        const result = safeParseJson<number[]>('[1, 2, 3]')
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toEqual([1, 2, 3])
        }
    })

    it('should handle null value', () => {
        const result = safeParseJson('null')
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toBeNull()
        }
    })
})
