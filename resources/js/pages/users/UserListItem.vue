<script setup>
import { formatDate } from '../../helper.js';
import { ref, onMounted } from 'vue';
import useToastr from '../../toastr';

const toastr = useToastr();
const props = defineProps({
    user: Object,
    index: Number,
    selectAll: Boolean
});

const emit = defineEmits(['editUser', 'toggleSelection', 'confirmUserDeletion']);

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
const toggleSelection = () => {
    emit('toggleSelection', props.user)
}

</script>

<template>
    <tr>
        <th>
            <input type="checkbox" :checked="selectAll" @change="toggleSelection">
        </th>
        <td>{{ user.id }}</td>
        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
        <td>{{ formatDate(user.created_at) }}</td>
        <td>
            <select name="" id="" class="form-control" @change="changeRole(user, $event.target.value)">
                <option v-for="(role, index) in roles" :selected="(user.role === role.name)" :value="role.value"
                    :key="index">
                    {{ role.name }}
                </option>
            </select>

        </td>
        <td>
            <a href="#" @click.prevent="$emit('editUser', user)">
                <i class="fa fa-edit"></i>
            </a>
            <a href="#" @click.prevent="$emit('confirmUserDeletion', user.id)">
                <i class="fa fa-trash text-danger ml-2"></i>
            </a>
        </td>
    </tr>
</template>