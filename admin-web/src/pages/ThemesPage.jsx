import React, { useEffect, useState } from 'react'
import { adminApi } from '../lib/api'
import AlertBox from '../components/AlertBox'
import PageHeader from '../components/PageHeader'

const CATEGORY_OPTIONS = [
  'Default',
  'Nature',
  'Vibrant',
  'Premium',
  'Special',
  'Elegant',
  'Custom',
]

const UNLOCK_TYPE_OPTIONS = [
  { value: 'none', label: 'No Unlock Rule' },
  { value: 'level', label: 'Level' },
  { value: 'tasks_completed', label: 'Tasks Completed' },
  { value: 'streak', label: 'Current Streak (days)' },
  { value: 'focus_minutes', label: 'Focus Minutes' },
]

const VISUAL_EFFECT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'glow', label: 'Glow' },
]

const normalizeCategory = (category) => {
  if (!category || typeof category !== 'string') return 'Default'
  const normalized = category
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')

  return normalized || 'Default'
}

const normalizeUnlockType = (unlockType, unlockLevel = 1) => {
  const normalizedType = typeof unlockType === 'string' ? unlockType.trim().toLowerCase() : ''
  if (UNLOCK_TYPE_OPTIONS.some((option) => option.value === normalizedType)) {
    return normalizedType
  }

  return Number(unlockLevel) > 1 ? 'level' : 'none'
}

const buildUnlockSummary = (unlockType, unlockValue) => {
  if (unlockType === 'none') return 'No unlock requirement'
  if (unlockType === 'level') return `Reach level ${unlockValue}`
  if (unlockType === 'tasks_completed') return `Complete ${unlockValue} tasks`
  if (unlockType === 'streak') return `Reach a ${unlockValue}-day streak`
  if (unlockType === 'focus_minutes') return `Focus for ${unlockValue} minutes`
  return 'No unlock requirement'
}

const slugifyThemeId = (value) => {
  return `${value || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

function ThemeEditor({ theme, onClose, onSaved }) {
  const createInitialForm = (incomingTheme) => {
    const normalizedCategory = normalizeCategory(incomingTheme?.category || 'Default')
    const usesCustomCategory = !CATEGORY_OPTIONS.includes(normalizedCategory)

    const unlockType = normalizeUnlockType(
      incomingTheme?.unlock_type,
      incomingTheme?.unlock_level,
    )

    const unlockValue = Number.isFinite(Number(incomingTheme?.unlock_value))
      ? Math.max(Number(incomingTheme?.unlock_value), unlockType === 'none' ? 0 : 1)
      : (unlockType === 'level' ? Math.max(Number(incomingTheme?.unlock_level || 1), 1) : 0)

    return {
      name: incomingTheme?.name || '',
      theme_id: incomingTheme?.theme_id || '',
      category: usesCustomCategory ? 'Custom' : normalizedCategory,
      custom_category: usesCustomCategory ? normalizedCategory : '',
      unlock_type: unlockType,
      unlock_value: unlockValue,
      visual_effect: incomingTheme?.visual_effect || 'none',
      is_premium: Boolean(incomingTheme?.is_premium),
      colors: incomingTheme?.colors || {
        background: '#0f172a',
        card: '#1e293b',
        cardSecondary: '#334155',
        text: '#e2e8f0',
        textSecondary: '#94a3b8',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    }
  }

  const [form, setForm] = useState(createInitialForm(theme))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(createInitialForm(theme))
  }, [theme])

  const saveTheme = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const resolvedCategory = form.category === 'Custom'
        ? normalizeCategory(form.custom_category)
        : form.category

      const resolvedUnlockType = normalizeUnlockType(form.unlock_type)
      const resolvedUnlockValue = resolvedUnlockType === 'none'
        ? 0
        : Math.max(Number(form.unlock_value) || 0, 1)

      const payload = {
        ...form,
        theme_id: theme ? form.theme_id : (slugifyThemeId(form.theme_id || form.name) || 'theme'),
        category: resolvedCategory,
        unlock_type: resolvedUnlockType,
        unlock_value: resolvedUnlockValue,
        unlock_level: resolvedUnlockType === 'level' ? resolvedUnlockValue : 1,
        unlock_requirement: '',
      }

      delete payload.custom_category

      if (theme) {
        await adminApi.updateTheme(theme.id, payload)
      } else {
        await adminApi.createTheme(payload)
      }
      onSaved()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <PageHeader title={theme ? 'Edit Theme' : 'Add Theme'} subtitle="This is a real React form, not static HTML." />
        <form className="stack" onSubmit={saveTheme}>
          <label><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label><span>Theme ID</span><input value={form.theme_id} onChange={(e) => setForm({ ...form, theme_id: slugifyThemeId(e.target.value) })} disabled={Boolean(theme)} required /></label>

          <label>
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          {form.category === 'Custom' && (
            <label><span>Custom Category</span><input value={form.custom_category} onChange={(e) => setForm({ ...form, custom_category: e.target.value })} required /></label>
          )}

          <label>
            <span>Unlock Rule Type</span>
            <select
              value={form.unlock_type}
              onChange={(e) => setForm({ ...form, unlock_type: e.target.value })}
            >
              {UNLOCK_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          {form.unlock_type !== 'none' && (
            <label><span>Unlock Value</span><input type="number" min="1" value={form.unlock_value} onChange={(e) => setForm({ ...form, unlock_value: e.target.value })} required /></label>
          )}

          <label><span>Unlock Rule Preview</span><input value={buildUnlockSummary(form.unlock_type, Number(form.unlock_value) || 0)} disabled /></label>

          <label>
            <span>Visual Effect</span>
            <select
              value={form.visual_effect}
              onChange={(e) => setForm({ ...form, visual_effect: e.target.value })}
            >
              {VISUAL_EFFECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="checkbox-row"><input type="checkbox" checked={Boolean(form.is_premium)} onChange={(e) => setForm({ ...form, is_premium: e.target.checked })} /><span>Premium theme</span></label>

          <div className="split-grid">
            <label><span>Background</span><input type="color" value={form.colors.background} onChange={(e) => setForm({ ...form, colors: { ...form.colors, background: e.target.value } })} /></label>
            <label><span>Card</span><input type="color" value={form.colors.card} onChange={(e) => setForm({ ...form, colors: { ...form.colors, card: e.target.value } })} /></label>
            <label><span>Card Secondary</span><input type="color" value={form.colors.cardSecondary} onChange={(e) => setForm({ ...form, colors: { ...form.colors, cardSecondary: e.target.value } })} /></label>
            <label><span>Text</span><input type="color" value={form.colors.text} onChange={(e) => setForm({ ...form, colors: { ...form.colors, text: e.target.value } })} /></label>
            <label><span>Text Secondary</span><input type="color" value={form.colors.textSecondary} onChange={(e) => setForm({ ...form, colors: { ...form.colors, textSecondary: e.target.value } })} /></label>
            <label><span>Accent</span><input type="color" value={form.colors.accent} onChange={(e) => setForm({ ...form, colors: { ...form.colors, accent: e.target.value } })} /></label>
            <label><span>Success</span><input type="color" value={form.colors.success} onChange={(e) => setForm({ ...form, colors: { ...form.colors, success: e.target.value } })} /></label>
            <label><span>Warning</span><input type="color" value={form.colors.warning} onChange={(e) => setForm({ ...form, colors: { ...form.colors, warning: e.target.value } })} /></label>
            <label><span>Error</span><input type="color" value={form.colors.error} onChange={(e) => setForm({ ...form, colors: { ...form.colors, error: e.target.value } })} /></label>
          </div>

          {error && <AlertBox kind="error" message={error} />}
          <div className="row">
            <button className="button ghost" type="button" onClick={onClose}>Cancel</button>
            <button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save theme'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ThemesPage() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)

  const loadThemes = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.themes()
      setThemes(data.themes || [])
    } catch (themesError) {
      setError(themesError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadThemes()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theme?')) return
    await adminApi.deleteTheme(id)
    loadThemes()
  }

  return (
    <section>
      <PageHeader
        title="Themes"
        subtitle="Manage theme definitions for the mobile app"
        action={<button className="button primary" onClick={() => { setEditingTheme(null); setEditorOpen(true) }}>Add theme</button>}
      />
      {error && <AlertBox kind="error" message={error} />}
      {loading ? <div className="panel muted">Loading themes...</div> : (
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unlock Rule</th>
                  <th>Effect</th>
                  <th>Premium</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {themes.map((theme) => (
                  <tr key={theme.id}>
                    <td>{theme.name}</td>
                    <td>{theme.category}</td>
                    <td>{buildUnlockSummary(theme.unlock_type || (theme.unlock_level > 1 ? 'level' : 'none'), Number(theme.unlock_value || theme.unlock_level || 0))}</td>
                    <td>{theme.visual_effect || 'none'}</td>
                    <td>{theme.is_premium ? 'Yes' : 'No'}</td>
                    <td className="actions-cell">
                      <button className="button ghost" onClick={() => { setEditingTheme(theme); setEditorOpen(true) }}>Edit</button>
                      <button className="button danger" onClick={() => handleDelete(theme.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {editorOpen && (
        <ThemeEditor
          theme={editingTheme}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false)
            loadThemes()
          }}
        />
      )}
    </section>
  )
}