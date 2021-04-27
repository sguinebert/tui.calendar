import type TZDate from '@src/time/date';

export type PanelName = 'milestone' | 'task' | 'allday' | 'time';
export type PanelType = 'daygrid' | 'timegrid';

export interface Panel {
  name: PanelName;
  type: PanelType;
  minHeight?: number;
  maxHeight?: number;
  showExpandableButton?: boolean;
  maxExpandableHeight?: number;
  handlers?: ['click', 'creation', 'move', 'resize'];
  show?: boolean;
}

export type GridInfoList = TZDate[];