import React, { useState } from "react";

const csOutcomes = [
  "Problem Solving",
  "Solution Development",
  "Communication",
  "Decision-Making",
  "Collaboration",
  "Application",
];

const WeeklyProgressReportForm = () => {
  const [formData, setFormData] = useState({
    tasks: "",
    challenges: "",
    lessons: "",
    week: "1",
    outcomes: [],
  });

  const [submittedReports, setSubmittedReports] = useState([]);

  const toggleOutcome = (outcome) => {
    setFormData((prev) => {
      const exists = prev.outcomes.includes(outcome);
      return {
        ...prev,
        outcomes: exists
          ? prev.outcomes.filter((o) => o !== outcome)
          : [...prev.outcomes, outcome],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.outcomes.length < 3) {
      alert("Please select at least 3 CS outcomes.");
      return;
    }
    setSubmittedReports([...submittedReports, formData]);
    setFormData({
      tasks: "",
      challenges: "",
      lessons: "",
      week: "1",
      outcomes: [],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Weekly Progress Report
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Tasks Performed</label>
            <textarea
              name="tasks"
              value={formData.tasks}
              onChange={handleChange}
              rows={3}
              placeholder="Describe what you worked on..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Challenges Faced</label>
            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              rows={3}
              placeholder="Mention any difficulties or blockers..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Lessons Learned</label>
            <textarea
              name="lessons"
              value={formData.lessons}
              onChange={handleChange}
              rows={3}
              placeholder="What did you learn from this week's work?"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Logbook Week</label>
              <select
                name="week"
                value={formData.week}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {[...Array(15)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    Week {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Select CS Outcomes (min 3)
              </label>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {csOutcomes.map((outcome) => (
                  <label
                    key={outcome}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.outcomes.includes(outcome)}
                      onChange={() => toggleOutcome(outcome)}
                      className="accent-blue-600"
                    />
                    <span>{outcome}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-200"
          >
            Submit Report
          </button>
        </form>

        {/* Submitted Reports */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-3 text-gray-700">
            Submitted Reports
          </h3>
          {submittedReports.length === 0 ? (
            <p className="text-gray-500 italic">No reports submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {submittedReports.map((report, index) => (
                <div
                  key={index}
                  className="border border-gray-300 p-4 rounded-md bg-gray-50"
                >
                  <p>
                    <strong>Week {report.week}</strong>
                  </p>
                  <p>
                    <strong>Tasks:</strong> {report.tasks}
                  </p>
                  <p>
                    <strong>Challenges:</strong> {report.challenges}
                  </p>
                  <p>
                    <strong>Lessons:</strong> {report.lessons}
                  </p>
                  <p>
                    <strong>CS Outcomes:</strong>{" "}
                    {report.outcomes.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgressReportForm;

