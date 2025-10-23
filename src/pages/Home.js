import React from 'react';
import ConstructionSteps from '../components/ConstructionSteps';

const Home = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12">
          <ConstructionSteps />
        </div>
      </div>
    </div>
  );
};

export default Home;
