export const PRIORITY_COLORS = {
  light: { alta: '#DC2626', media: '#D97706', baixa: '#16A34A' },
  dark: { alta: '#F87171', media: '#FBBF24', baixa: '#4ADE80' },
};

export const PRIORITY_LABELS = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

export function getPriorityFilterOptions(isDark) {
  const palette = isDark ? PRIORITY_COLORS.dark : PRIORITY_COLORS.light;
  return [
    { value: 'todas', label: 'Todos' },
    { value: 'alta', label: PRIORITY_LABELS.alta, color: palette.alta },
    { value: 'media', label: PRIORITY_LABELS.media, color: palette.media },
    { value: 'baixa', label: PRIORITY_LABELS.baixa, color: palette.baixa },
  ];
}
