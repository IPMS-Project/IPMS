import React from "react";

const RenewalSuccess = () => {

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Success!</h2>
          <p className="text-gray-600 mt-4">
            Your token has been updated. You can now securely login.
          </p>  
        </div>
    </div>
  );
};

export default RenewalSuccess;
