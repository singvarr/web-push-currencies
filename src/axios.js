import axios from "axios";

const axiosInstance = axios.create({baseURL: `http://localhost:${process.env.REACT_APP_SERVER_PORT}`})

export default axiosInstance;
