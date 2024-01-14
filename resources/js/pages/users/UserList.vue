<script setup>
import { ref, onMounted, watch } from 'vue';
import { Bootstrap4Pagination } from 'laravel-vue-pagination';
import { Form, Field } from 'vee-validate';
import * as yup from 'yup';
import useToastr from '../../toastr';
import UserListItem from './UserListItem.vue';
import { debounce } from 'lodash';

const toastr = useToastr();
// ref([]) faz com que a variavel seja reativa
const users = ref({ 'data': [] });
const editing = ref(false);
const formValues = ref({
    id: '',
    name: '',
    email: ''
});
const form = ref(null);

const createUser = (values, { resetForm, setErrors }) => {
    axios.post('/api/users', values)
        .then((response) => {
            // users.value.unshift(response.data) -> Para colocar em primeiro
            users.value.data.push(response.data)
            $('#userFormModal').modal('hide');
            resetForm();
            toastr.success('User created successfully!');
        }).catch(error => {
            console.log(error);
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        });
}
const getUsers = (page = 1) => {
    axios.get(`/api/users?page=${page}`)
        .then((response) => {
            users.value = response.data;
            selectedUsers.value = [];
            selectAll.value = false;
        });
}
const addUser = () => {
    form.value.resetForm();
    $("#userFormModal").modal('show');
    editing.value = false;

}
const handleSubmit = (values, actions) => {
    if (editing.value) {
        updateUser(values, actions);
    } else {
        createUser(values, actions);
    }
}

const editUser = (user) => {
    editing.value = true;
    form.value.resetForm();
    $("#userFormModal").modal('show');
    formValues.value = {
        id: user.id,
        name: user.name,
        email: user.email
    };

}
const updateUser = (values, { setErrors }) => {
    axios.put('/api/users/' + formValues.value.id, values)
        .then((response) => {
            const index = users.value.findIndex(user => user.id === response.data.id);
            users.value[index] = response.data;
            $("#userFormModal").modal('hide');
            toastr.success('User updated successfully!');
        }).catch((error) => {
            console.log(error.response.data.errors);
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        });
}
const searchQuery = ref([null]);
const search = () => {
    axios.get('/api/users/serach', {
        params: {
            query: searchQuery.value
        }
    }).then(response => {
        users.value = response.data;
    }).catch(error => {
        console.log(error);
    });
}
const selectedUsers = ref([]);
const toggleSelection = (user) => {
    const index = selectedUsers.value.indexOf(user.id);
    if (index === -1) {
        selectedUsers.value.push(user.id);
    } else {
        selectedUsers.value.splice(index, 1);
    }
    console.log(selectedUsers.value);
}
const bulkDelete = () => {
    axios.delete('/api/users', {
        data: {
            ids: selectedUsers.value
        }
    }).then(response => {
        users.value.data = users.value.data.filter(user => !selectedUsers.value.includes(user.id));
        selectedUsers.value = [];
        selectAll.value = false;
        toastr.success(response.data.message)
    });
}
const selectAll = ref(false);
const selectAllUsers = () => {
    if (selectAll.value) {
        selectedUsers.value = users.value.data.map(user => user.id);
    } else {
        selectedUsers.value = [];
    }
}
const userIdBeingDeleted = ref(null);
const confirmUserDeletion = (id) => {
    userIdBeingDeleted.value = id;
    $('#deleteUserModal').modal('show');
}
const deleteUser = (id) => {
    axios.delete(`/api/users/${userIdBeingDeleted.value}`)
        .then(() => {
            $('#deleteUserModal').modal('hide');
            toastr.success('User deleted successfully!');
            users.value.data = users.value.data.filter(user => user.id !== userIdBeingDeleted.value)
        });
}
watch(searchQuery, debounce(() => {
    search();
}, 300));

onMounted(() => {
    getUsers();
})
const createUserSchema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required().min(8)
});
const editUserSchema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().when((password, schema) => {
        return password[0] ? schema.required().min(8) : schema;
    }),
});



</script>

<template>
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Users</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="#">Home</a></li>
                        <li class="breadcrumb-item active">Users</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div class="content">
        <div class="container-fluid">
            <div class="d-flex justify-content-between">
                <div>
                    <button @click.prevent="addUser" type="button" class="mb-2 btn btn-primary">
                        <i class="fa fa-plus-circle mr-1"></i>
                        Add New User
                    </button>
                    <button v-if="selectedUsers.length > 0" @click.prevent="bulkDelete" type="button"
                        class="mb-2 ml-2 btn btn-danger">
                        <i class="fa fa-trash mr-1"></i>
                        Delete Selected
                    </button>
                    <span class="ml-2" v-if="selectedUsers.length > 0">Selected {{ selectedUsers.length }} users</span>
                </div>
                <div>
                    <input type="text" v-model="searchQuery" class="form-control" placeholder="Search...">
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" @change="selectAllUsers" v-model="selectAll">
                                </th>
                                <th style="width: 10px;">#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Registered Date</th>
                                <th>Role</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody v-if="users.data.length > 0">
                            <UserListItem v-for="(user, index) in users.data" :key="user.id" :user="user" :index="index"
                                @edit-user="editUser" @toggle-selection="toggleSelection"
                                :select-all="selectAll" @confirm-user-deletion="confirmUserDeletion" />
                        </tbody>
                        <tbody v-else>
                            <tr>
                                <td colspan="6" class="text-center">No results found...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <Bootstrap4Pagination :data="users" @pagination-change-page="getUsers" />
        </div>
    </div>

    <div class=" modal fade" id="userFormModal" data-backdrop="static" tabindex="-1" role="dialog"
        aria-labelledby="userFormModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="userFormModalLabel">
                        <span v-if="editing">Edit User</span>
                        <span v-else>Add New User</span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <Form ref="form" @submit="handleSubmit" :validation-schema="editing ? editUserSchema : createUserSchema"
                    v-slot="{ errors }" :initial-values="formValues">
                    <div class="modal-body">
                        <Field type="hidden" name="id" v-model="formValues.id"></Field>
                        <div class="form-group">
                            <label for="name">Name</label>
                            <Field name="name" type="text" :class="{ 'is-invalid': errors.name }" class="form-control "
                                v-model="formValues.name" id="name" aria-describedby="nameHelp"
                                placeholder="Enter full name"></Field>
                            <span class="invalid-feedback">{{ errors.name }}</span>
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <Field name="email" type="email" class="form-control" :class="{ 'is-invalid': errors.email }"
                                v-model="formValues.email" id="email" aria-describedby="nameHelp"
                                placeholder="Enter full name"></Field>
                            <span class="invalid-feedback">{{ errors.email }}</span>
                        </div>


                        <div class="form-group">
                            <label for="email">Password</label>
                            <Field name="password" type="password" :class="{ 'is-invalid': errors.password }"
                                class="form-control " id="password" aria-describedby="nameHelp"
                                placeholder="Enter password"></Field>
                            <span class="invalid-feedback">{{ errors.password }}</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </Form>
            </div>
        </div>
    </div>
    <div class="modal fade" id="deleteUserModal" data-backdrop="static" tabindex="-1" role="dialog"
        aria-labelledby="deleteUserModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteUserModalLabel">
                        <span>Delete User</span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h5>Are you sure you want to delete this user?</h5>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button @click.prevent="deleteUser" type="button" class="btn btn-primary">Delete
                        User</button>
                </div>
            </div>
        </div>
    </div>
</template>
