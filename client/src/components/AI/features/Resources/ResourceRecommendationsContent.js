import React from 'react';

const ResourceRecommendationsContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Online Courses</h3>
        <div className="space-y-2">
          {['Course 1', 'Course 2', 'Course 3'].map((course) => (
            <div key={course} className="p-2 hover:bg-gray-50 rounded">
              {course}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Books</h3>
        <div className="space-y-2">
          {['Book 1', 'Book 2', 'Book 3'].map((book) => (
            <div key={book} className="p-2 hover:bg-gray-50 rounded">
              {book}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ResourceRecommendationsContent;