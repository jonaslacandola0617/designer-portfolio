"use client";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
export function SortableList<T extends { id: string }>({
  items,
  onChange,
  children,
  grid=false,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  children: (item: T, handle: React.ReactNode) => React.ReactNode;
  grid?:boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id)
          onChange(
            arrayMove(
              items,
              items.findIndex((i) => i.id === active.id),
              items.findIndex((i) => i.id === over.id),
            ),
          );
      }}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={grid?rectSortingStrategy:verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {(handle) => children(item, handle)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <div
      className="sortable-item"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      {children(
        <button
          type="button"
          className="drag-handle"
          aria-label="Drag to reorder; press Space then arrow keys"
          {...attributes}
          {...listeners}
        >
          ↕
        </button>,
      )}
    </div>
  );
}
