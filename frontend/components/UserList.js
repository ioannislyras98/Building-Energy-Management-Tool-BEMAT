import { getuser } from "../services/ApiService";
import { useEffect, useState } from "react";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mount = true;
    getuser()
      .then((res) => {
        console.log("Response from api", res);
        if (mount) {
          setUsers(res);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    // Η συνάρτηση επιστροφής καλείται όταν "καταστρέφεται" το component
    return () => {
      mount = false;
    };
  }, []);

  return <div>UserList</div>;
};

export default UserList;