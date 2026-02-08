import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';

// Inline CSS transform helper to avoid @dnd-kit/utilities dependency
function transformToString(transform: { x: number; y: number; scaleX: number; scaleY: number } | null): string | undefined {
  if (!transform) return undefined;
  return `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

export interface KanbanItem {
  id: string;
  columnId: string;
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onMove: (itemId: string, newColumnId: string) => void;
  onItemClick?: (item: KanbanItem) => void;
}

// Sortable card within a column
function SortableCard({
  item,
  onClick,
}: {
  item: KanbanItem;
  onClick?: (item: KanbanItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: transformToString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(item)}
      className={clsx(
        'bg-navy-900/80 border border-navy-700/50 rounded-lg p-3 cursor-grab active:cursor-grabbing',
        'hover:border-navy-600 transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <p className="text-sm font-medium text-white">{item.title}</p>
      {item.subtitle && (
        <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
      )}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(item.metadata).map(([key, value]) => (
            <span
              key={key}
              className="text-xs px-2 py-0.5 bg-navy-700/60 rounded text-gray-400"
            >
              {key}: {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Card overlay shown during drag
function CardOverlay({ item }: { item: KanbanItem }) {
  return (
    <div className="bg-navy-900 border border-ascent-blue/50 rounded-lg p-3 shadow-xl shadow-ascent-blue/10">
      <p className="text-sm font-medium text-white">{item.title}</p>
      {item.subtitle && (
        <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
      )}
    </div>
  );
}

// Droppable column container
function DroppableColumn({
  column,
  items,
  onItemClick,
}: {
  column: KanbanColumn;
  items: KanbanItem[];
  onItemClick?: (item: KanbanItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
        <h3 className="text-sm font-semibold text-white">{column.title}</h3>
        <span className="text-xs text-gray-500 bg-navy-700/60 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 space-y-2 p-2 rounded-lg min-h-[200px] transition-colors',
          isOver ? 'bg-ascent-blue/5 border border-dashed border-ascent-blue/30' : 'bg-navy-800/30'
        )}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableCard key={item.id} item={item} onClick={onItemClick} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-600">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ columns, items, onMove, onItemClick }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const item = items.find((i) => i.id === event.active.id);
    if (item) setActiveItem(item);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const draggedItemId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    const targetColumn = columns.find((c) => c.id === overId);
    if (targetColumn) {
      onMove(draggedItemId, targetColumn.id);
      return;
    }

    // Check if dropped over another item -> move to that item's column
    const overItem = items.find((i) => i.id === overId);
    if (overItem) {
      onMove(draggedItemId, overItem.columnId);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnItems = items.filter((item) => item.columnId === column.id);
          return (
            <DroppableColumn
              key={column.id}
              column={column}
              items={columnItems}
              onItemClick={onItemClick}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? <CardOverlay item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
