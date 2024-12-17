import React, { useState, useEffect } from 'react';
import moment from 'moment';
import '../../styles/activities/EventModal.css';
import { toast } from 'react-toastify';

const EventModal = ({ isOpen, onClose, event, onDelete, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAllDay, setIsAllDay] = useState(true);

  useEffect(() => {
    if (event) {
      setEditedEvent(event);
      setIsAllDay(event.allDay);
      setEditMode(false);
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setIsAllDay(checked);
      setEditedEvent(prev => ({
        ...prev,
        allDay: checked,
        start: checked ? new Date(prev.start).setHours(0, 0, 0, 0) : prev.start,
        end: checked ? new Date(prev.start).setHours(23, 59, 59, 999) : prev.end
      }));
    } else {
      setEditedEvent(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = () => {
    const taskId = event._id || event.id;
    if (!taskId) {
      toast.error('Invalid task ID');
      return;
    }

    const start = new Date(editedEvent.start);
    const end = new Date(editedEvent.start);

    if (!isAllDay) {
      const [startHours, startMinutes] = editedEvent.startTime?.split(':') || ['00', '00'];
      const [endHours, endMinutes] = editedEvent.endTime?.split(':') || ['23', '59'];
      
      start.setHours(parseInt(startHours), parseInt(startMinutes), 0);
      end.setHours(parseInt(endHours), parseInt(endMinutes), 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    onUpdate({
      _id: taskId,
      id: taskId,
      title: editedEvent.title,
      description: editedEvent.description,
      start,
      end,
      allDay: isAllDay,
      dueDate: start
    });
    setEditMode(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const taskId = event._id || event.id;
    if (taskId) {
      await onDelete(taskId);
    } else {
      toast.error('Invalid task ID');
      console.error('Missing task ID:', event);
    }
    setIsDeleting(false);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="event-modal-overlay">
      <div className="event-modal-content">
        {editMode ? (
          <div>
            <input
              type="text"
              name="title"
              value={editedEvent.title}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <textarea
              name="description"
              value={editedEvent.description}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
            />
            
            <div className="flex items-center space-x-2 my-4">
              <input
                type="checkbox"
                id="allDay"
                checked={isAllDay}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-500 rounded border-gray-300"
              />
              <label htmlFor="allDay" className="text-sm text-gray-700">
                All day task
              </label>
            </div>

            <input
              type="date"
              name="start"
              value={moment(editedEvent.start).format("YYYY-MM-DD")}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
            />

            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={editedEvent.startTime || "09:00"}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={editedEvent.endTime || "17:00"}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                Save
              </button>
              <button onClick={() => setEditMode(false)} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <p className="text-gray-600">
              Date: {moment(event.start).format("MMMM D, YYYY")}
              {!event.allDay && (
                <span>
                  <br />
                  Time: {moment(event.start).format("h:mm A")} - {moment(event.end).format("h:mm A")}
                </span>
              )}
            </p>
            <div className="flex justify-end mt-4">
              <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
