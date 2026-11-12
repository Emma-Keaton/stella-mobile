/**
 * Stella Mobile — Dropdown Component
 * Simple dropdown selector for settings
 */

import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'

interface DropdownOption {
  value: string
  label: string
  icon?: string
  description?: string
}

interface DropdownProps {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  placeholder?: string
  style?: any
}

export function Dropdown({ label, value, options, onChange, placeholder, style }: DropdownProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedOption, setSelectedOption] = useState(options.find(o => o.value === value) || options[0])
  const dropdownRef = useRef<View>(null)
  const animation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const opt = options.find(o => o.value === value)
    if (opt) setSelectedOption(opt)
  }, [value, options])

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [expanded, animation])

  const toggle = () => setExpanded(!expanded)

  const selectOption = (option: DropdownOption) => {
    setSelectedOption(option)
    onChange(option.value)
    setExpanded(false)
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        ref={dropdownRef}
        onPress={toggle}
        style={styles.trigger}
        activeOpacity={0.8}
      >
        <View style={styles.triggerContent}>
          {selectedOption.icon && <Text style={styles.triggerIcon}>{selectedOption.icon}</Text>}
          <Text style={styles.triggerText} numberOfLines={1}>
            {selectedOption.label}
          </Text>
        </View>
        <Animated.Text style={[
          styles.chevron,
          { transform: [{ rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }
        ]}>
          ▼
        </Animated.Text>
      </TouchableOpacity>

      <Animated.View style={[
        styles.dropdown,
        { opacity: animation, height: expanded ? undefined : 0 }
      ]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => selectOption(option)}
            style={[
              styles.option,
              option.value === value ? styles.optionSelected : {}
            ]}
          >
            <View style={styles.optionContent}>
              {option.icon && <Text style={styles.optionIcon}>{option.icon}</Text>}
              <View>
                <Text style={[
                  styles.optionLabel,
                  option.value === value ? styles.optionLabelSelected : {}
                ]}>
                  {option.label}
                </Text>
                {option.description && (
                  <Text style={[
                    styles.optionDesc,
                    option.value === value ? styles.optionDescSelected : {}
                  ]}>
                    {option.description}
                  </Text>
                )}
              </View>
            </View>
            {option.value === value && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  triggerText: {
    fontSize: 15,
    flex: 1,
  },
  chevron: {
    fontSize: 12,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 100,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 56,
  },
  optionSelected: {},
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionLabelSelected: {},
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  optionDescSelected: {},
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
})