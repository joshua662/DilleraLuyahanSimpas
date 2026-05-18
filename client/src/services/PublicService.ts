import AxiosInstance from "./AxiosInstance";
import type { Service, Testimonial } from "../interfaces/types";

const PublicService = {
  getServices: () => AxiosInstance.get<{ services: Service[] }>("/services"),
  getTestimonials: () => AxiosInstance.get<{ testimonials: Testimonial[] }>("/testimonials"),
};

export default PublicService;
