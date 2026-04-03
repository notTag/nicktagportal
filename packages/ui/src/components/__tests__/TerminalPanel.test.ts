import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TerminalPanel from '../TerminalPanel.vue'

const sampleCommands = {
  ls: { description: 'List files', output: 'file1.txt  file2.txt' },
  whoami: { description: 'Show current user', output: 'nick' },
}

const sampleOutput = [
  { input: 'hello', output: 'command not found: hello' },
]

describe('TerminalPanel', () => {
  it('renders without errors', () => {
    const wrapper = mount(TerminalPanel)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default output entries when provided', () => {
    const wrapper = mount(TerminalPanel, {
      props: { defaultOutput: sampleOutput },
    })
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('command not found: hello')
  })

  it('renders the command input form with prompt character', () => {
    const wrapper = mount(TerminalPanel)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('$')
  })

  it('executes a known command and renders output', async () => {
    const wrapper = mount(TerminalPanel, {
      props: { commands: sampleCommands },
    })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('ls')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('file1.txt  file2.txt')
  })

  it('renders command not found for unknown commands', async () => {
    const wrapper = mount(TerminalPanel, {
      props: { commands: sampleCommands },
    })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('unknown')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('command not found: unknown')
  })

  it('clears input after command execution', async () => {
    const wrapper = mount(TerminalPanel, {
      props: { commands: sampleCommands },
    })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('ls')
    await wrapper.find('form').trigger('submit')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('does not execute when input is empty', async () => {
    const wrapper = mount(TerminalPanel)
    const historyBefore = wrapper.findAll('.mb-3')
    await wrapper.find('form').trigger('submit')
    const historyAfter = wrapper.findAll('.mb-3')
    expect(historyAfter).toHaveLength(historyBefore.length)
  })

  it('applies destructive color class for command not found errors', async () => {
    const wrapper = mount(TerminalPanel, {
      props: { commands: sampleCommands },
    })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('bad')
    await wrapper.find('form').trigger('submit')
    const errorOutput = wrapper.findAll('.text-destructive')
    expect(errorOutput.length).toBeGreaterThan(0)
  })
})
