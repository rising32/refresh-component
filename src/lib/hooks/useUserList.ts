import {useState} from 'react';

export type IUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
};
export type IResponse = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: IUser[];
};
export interface IUserList {
  loading: boolean;
  users: IUser[];
  page: number;
  totalUserNum: number;
  totalPage: number;
  onMore: () => void;
  loadUsers: () => void;
}

export const useUserList = (): IUserList => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalUserNum, setTotalUserNum] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // useEffect(() => {
  //   let isMounted = true;
  //   async function fetchUsers() {
  //     setLoading(true);
  //     const res = await fetch(`https://reqres.in/api/users?page=${page}`);
  //     if (isMounted) {
  //       const json: IResponse = await res.json();
  //       console.log(res.status);
  //       // if (page > 1) {
  //       //   setUsers(preState => ({...preState, ...json.data}));
  //       // } else {
  //       //   setUsers(json.data);
  //       // }
  //       setUsers(preState => preState.concat(json.data));

  //       setTotalPage(json.total_pages);
  //       setTotalUserNum(json.total);
  //       setLoading(false);
  //     }
  //   }
  //   fetchUsers();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [page]);
  async function loadUsers() {
    setLoading(true);

    setTimeout(async () => {
      const res = await fetch(`https://reqres.in/api/users?page=${page}`);

      const json: IResponse = await res.json();
      setUsers(json.data);

      setTotalPage(json.total_pages);
      setTotalUserNum(json.total);
      setLoading(false);
    }, 5000);
  }
  const onMore = () => {
    if (page < totalPage) {
      setPage(page + 1);
    } else {
      setLoading(false);
    }
  };

  return {
    loading,
    users,
    page,
    totalUserNum,
    totalPage,
    onMore,
    loadUsers,
  };
};
