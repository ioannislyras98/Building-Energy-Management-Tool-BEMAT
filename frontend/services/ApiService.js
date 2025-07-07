import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export function getuser(){
    return axios.get('http://127.0.0.1:8000/user/')      
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });
}

// Prefecture API functions
export function getAllPrefectures() {
    const token = cookies.get("token") || "";
    return axios.get('http://127.0.0.1:8000/prefectures/active/all/', {
        headers: {
            Authorization: `Token ${token}`,
        },
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log('Error fetching prefectures:', error);
        throw error;
    });
}

export function getPrefecturesByZone(zone) {
    const token = cookies.get("token") || "";
    return axios.get(`http://127.0.0.1:8000/prefectures/zone/${zone}/`, {
        headers: {
            Authorization: `Token ${token}`,
        },
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log('Error fetching prefectures by zone:', error);
        throw error;
    });
}

export function getEnergyZones() {
    const token = cookies.get("token") || "";
    return axios.get('http://127.0.0.1:8000/prefectures/zones/list/', {
        headers: {
            Authorization: `Token ${token}`,
        },
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log('Error fetching energy zones:', error);
        throw error;
    });
}