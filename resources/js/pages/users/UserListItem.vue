<script setup>
import { formatDate } from '../../helper.js';
import { ref, onMounted } from 'vue';
import useToastr from '../../toastr';

const toastr = useToastr();
defineProps({
    user: Object,
    index: Number
});

const userIdBeingDeleted = ref(null);
const emit = defineEmits(['userDeleted', 'editUser']);

const confirmUserDeletion = (user) => {
    userIdBeingDeleted.value = user.id;
    $('#deleteUserModal').modal('show');
}
const deleteUser = (id) => {
    axios.delete(`/api/users/${userIdBeingDeleted.value}`)
        .then(() => {
            $('#deleteUserModal').modal('hide');
            toastr.success('User deleted successfully!');
            emit('userDeleted', userIdBeingDeleted.value);
        });
}
const changeRole = (user, role) => {
    axios.patch(`/api/users/${user.id}/chage-role`, {
        role: role
    }).then(() => {
        toastr.success('Role changed successfully!');
    });
}

const roles = ref([
    {
        name: 'ADMIN',
        value: 1
    },
    {
        name: 'USER',
        value: 2
    },
]);

</script>

<template>
    <tr>
        <td>{{ user.id }}</td>
        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
        <td>{{ formatDate(user.created_at) }}</td>
        <td>
            <select name="" id="" class="form-control" @change="changeRole(user, $event.target.value)">
                <option v-for="(role, index) in roles" :selected="(user.role === role.name)" :value="role.value" :key="index">
                    {{ role.name }}
                </option>
            </select>

        </td>
        <td>
            <a href="#" @click.prevent="$emit('editUser', user)">
                <i class="fa fa-edit"></i>
            </a>
            <a href="#" @click.prevent="confirmUserDeletion(user)">
                <i class="fa fa-trash text-danger ml-2"></i>
            </a>
        </td>
    </tr>

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