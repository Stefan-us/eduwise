import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ToastContainer, toast } from 'react-toastify';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/activities/Activities.css';
import { CustomToolbar, EventModal } from '../components/calendar';

// Initialize localizer outside the component
const localizer = momentLocalizer(moment);

function ActivitiesPage({ user, tasks, removeTask, updateTask }) {
  const [view, setView] = useState(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const events = useMemo(() => tasks.map(task => {
    const start = task.start ? new Date(task.start) : new Date(task.dueDate);
    const end = task.end ? new Date(task.end) : new Date(task.dueDate);
    
    // If it's an all-day event, clear the time component
    if (task.allDay) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return {
      id: task._id,
      title: task.title,
      start,
      end,
      allDay: task.allDay,
      description: task.description,
      completed: task.completed,
      _id: task._id
    };
  }), [tasks]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    if (!taskId) {
      toast.error('Invalid task ID');
      return;
    }
    removeTask(taskId);
    setIsModalOpen(false);
    toast.success('Task deleted successfully');
  }, [removeTask]);

  const handleUpdateTask = useCallback((updatedTask) => {
    const taskId = updatedTask._id || updatedTask.id;  // Try both possible ID formats
    if (!taskId) {
      toast.error('Invalid task ID');
      return;
    }
    updateTask(taskId, updatedTask);
    setIsModalOpen(false);
    toast.success('Task updated successfully');
  }, [updateTask]);

  const eventStyleGetter = useCallback((event) => {
    const now = new Date();
    const eventEnd = new Date(event.end);
    const isOverdue = !event.completed && eventEnd < now;
    
    const style = {
      backgroundColor: event.completed ? '#10B981' : isOverdue ? '#EF4444' : '#3B82F6',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block',
      textDecoration: event.completed ? 'line-through' : 'none',
      padding: '2px 5px',
      fontSize: '0.9rem',
      height: event.allDay ? 'auto' : '100%',
    };
    return { style };
  }, []);

  const TimeSlotWrapper = useCallback(({ children }) => (
    <div className="custom-time-slot">
      {children}
    </div>
  ), []);

  const TimeGutterHeader = useCallback(() => (
    <div className="time-gutter-header">Time</div>
  ), []);

  useEffect(() => {
    document.title = 'Eduwise - Activities';
    return () => {
      document.title = 'Eduwise';
    };
  }, []);

  return (
    <>
      <div className="viewHeader">
        <div className="title flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-gray-700" />
          <span>Calendar</span>
        </div>
      </div>
      <div className="content calendar-container">
        <ErrorBoundary>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={view}
            onView={handleViewChange}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            step={30}
            timeslots={2}
            min={new Date(0, 0, 0, 7, 0, 0)}
            max={new Date(0, 0, 0, 21, 0, 0)}
            components={{
              toolbar: CustomToolbar,
              timeSlotWrapper: TimeSlotWrapper,
              timeGutterHeader: TimeGutterHeader,
            }}
            dayLayoutAlgorithm="no-overlap"
          />
        </ErrorBoundary>
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onDelete={handleDeleteTask}
        onUpdate={handleUpdateTask}
      />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default ActivitiesPage;
