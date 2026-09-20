import React from 'react';
import {
  BookOpen,
  Award,
  Star,
  Crown,
  Sparkles,
  Bookmark,
  Sun,
  ShieldCheck,
  GraduationCap,
  Flame,
  Heart,
  Users,
} from 'lucide-react';

export const GROUP_ICONS_LIST = [
  { id: 'book', label: 'مصحف / كتاب', Icon: BookOpen },
  { id: 'award', label: 'وسام التميز', Icon: Award },
  { id: 'star', label: 'نجمة التفوق', Icon: Star },
  { id: 'crown', label: 'تاج الوقار', Icon: Crown },
  { id: 'sparkles', label: 'شرارة إبداع', Icon: Sparkles },
  { id: 'bookmark', label: 'علامة المتابعة', Icon: Bookmark },
  { id: 'sun', label: 'شمس الهدى', Icon: Sun },
  { id: 'shield', label: 'درع الحفظ', Icon: ShieldCheck },
  { id: 'grad', label: 'قبعة العلم', Icon: GraduationCap },
  { id: 'flame', label: 'شعلة الهمة', Icon: Flame },
  { id: 'heart', label: 'محبة القرآن', Icon: Heart },
  { id: 'users', label: 'جمع الطلاب', Icon: Users },
];

export const GROUP_PRESET_COLORS = [
  { hex: '#1B2A4A', name: 'كحلي دافئ' },
  { hex: '#27AE60', name: 'أخضر زمردي' },
  { hex: '#3498DB', name: 'أزرق سماوي' },
  { hex: '#E8A87C', name: 'ذهبي تاج الوقار' },
  { hex: '#8E44AD', name: 'بنسجي ملكي' },
  { hex: '#E74C3C', name: 'أحمر قاني' },
  { hex: '#F39C12', name: 'برتقالي دافئ' },
  { hex: '#16A085', name: 'تركوازي هادئ' },
];

interface GroupIconProps {
  iconName?: string;
  className?: string;
  color?: string;
}

export const GroupIcon: React.FC<GroupIconProps> = ({ iconName, className = 'w-4 h-4', color }) => {
  const found = GROUP_ICONS_LIST.find((item) => item.id === iconName);
  const IconComponent = found ? found.Icon : Users;

  return <IconComponent className={className} style={{ color: color || undefined }} />;
};
