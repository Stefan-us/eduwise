import React from 'react';
import moment from 'moment';

const CustomToolbar = (props) => {

  const goToBack = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    props.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(props.date);
    return (
      <span className="text-lg font-semibold">
        {date.format('MMMM')} {date.format('YYYY')}
      </span>
    );
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={goToBack}
        >
          Back
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={goToNext}
        >
          Next
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          onClick={goToCurrent}
        >
          Today
        </button>
      </div>
      <div className="text-xl font-bold">{label()}</div>
      <div>
        <button
          className={`mr-2 ${props.view === 'month' ? 'font-bold' : ''}`}
          onClick={() => props.onView('month')}
        >
          Month
        </button>
        <button
          className={`mr-2 ${props.view === 'week' ? 'font-bold' : ''}`}
          onClick={() => props.onView('week')}
        >
          Week
        </button>
        <button
          className={`mr-2 ${props.view === 'day' ? 'font-bold' : ''}`}
          onClick={() => props.onView('day')}
        >
          Day
        </button>
        <button
          className={`${props.view === 'agenda' ? 'font-bold' : ''}`}
          onClick={() => props.onView('agenda')}
        >
          Agenda
        </button>
      </div>
    </div>
  );
};

export default CustomToolbar;
