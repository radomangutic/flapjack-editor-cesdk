import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { IUserDetails } from "../../interfaces";
import { Button, Container, Flex, Paper, Text } from "@mantine/core";
import { UsersTable } from "../../components/resturant/UsersTable";
import CommanModal from "../../components/CommanModal";
import { useState } from "react";
import RemoveUser from "../../components/resturant/RemoveUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import PrivatePage from "../../components/PrivatePage/PrivatePage";
import { useUser } from "../../hooks";
import AddNewUser from "../../components/resturant/AddNewUser";
import { dbClient } from "../../tests/helpers/database.helper";
import UpdateUser from "../../components/resturant/UpdateUser";

export type ModalType = "empty" | "removeUser" | "addUser" | "editUser";
const Dashboard = ({ profiles }: { profiles: [] }) => {
  const { supabaseClient: supabase } = useSessionContext();
  const user = useUser();
  const [modalType, setmodalType] = useState<ModalType>("empty");
  const [selectedUser, setselectedUser] = useState<IUserDetails | null>(null);
  const [allUsers, setallUsers] = useState<IUserDetails[]>(profiles);
  const [isLoading, setisLoading] = useState(false);

  if (user?.role !== "flapjack") {
    return <PrivatePage />;
  }

  const onRemove = async () => {
    if (!selectedUser || !supabase) return;
    setisLoading(true);
    // Update the user's restaurant_id to empty
    const { data, error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", selectedUser.id);

    if (error) {
      alert("Something went wrong");
      setisLoading(false);
      setmodalType("empty");
      return;
    }
    const res = await dbClient.auth.admin.deleteUser(selectedUser.id);
    const filterList = allUsers?.filter((user) => user.id !== selectedUser.id);
    setallUsers(filterList);
    setisLoading(false);

    setmodalType("empty");
  };
  const modalClose = () => {
    setmodalType("empty");
    setselectedUser(null);
  };
  return (
    <Paper bg={"white"} mih={"100vh"}>
      <Container size="xl" pt={10}>
        <Flex justify={"flex-end"} my={10}>
          <Button
            size="xs"
            color="orange"
            onClick={() => setmodalType("addUser")}
            sx={{ marginRight: "1rem" }}
          >
            Add User
          </Button>
        </Flex>
        <UsersTable
          data={allUsers}
          // onDelete={(item) => {
          //   setselectedUser(item);
          //   setmodalType("removeUser");
          // }}
          onEdit={(user) => {
            setselectedUser(user);
            setmodalType("editUser");
          }}
        />

        {
          {
            editUser: (
              <CommanModal
                title={"Update User"}
                isOpen={true}
                onClose={modalClose}
              >
                <UpdateUser
                  onClose={modalClose}
                  newUser={(user) => {
                    const updateUserList = allUsers?.map((item) => {
                      if (item?.id === user?.id) {
                        return user;
                      }
                      return item;
                    });
                    setallUsers(updateUserList);
                  }}
                  selectedUser={selectedUser}
                />
              </CommanModal>
            ),
            addUser: (
              <CommanModal
                title={"Add New User"}
                isOpen={true}
                onClose={modalClose}
              >
                <AddNewUser
                  onClose={modalClose}
                  newUser={(user) => {
                    setallUsers([user, ...allUsers]);
                  }}
                />
              </CommanModal>
            ),
            empty: <></>,
            removeUser: (
              <CommanModal
                title={"Remove a user"}
                isOpen={true}
                onClose={modalClose}
              >
                <RemoveUser
                  onClose={modalClose}
                  onRemove={onRemove}
                  isLoading={isLoading}
                  userEmail={selectedUser?.email}
                />
              </CommanModal>
            ),
          }[modalType]
        }
      </Container>
    </Paper>
  );
};

export default Dashboard;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);
  // Fetch user profiles from Supabase where id matches
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    props: {
      profiles: data,
    },
  };
}
