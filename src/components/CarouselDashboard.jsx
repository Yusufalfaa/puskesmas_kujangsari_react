import React from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CarouselDashboard.css';

const CarouselDashboard = () => {
  return (
    <Carousel fade>
      <Carousel.Item>
        <img className="d-block w-100" src="/assets/gambar1.jpeg" alt="Slide 1" />
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" src="/assets/gambar2.jpeg" alt="Slide 2" />
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" src="/assets/gambar3.jpeg" alt="Slide 3" />
      </Carousel.Item>
    </Carousel>
  );
};

export default CarouselDashboard;
