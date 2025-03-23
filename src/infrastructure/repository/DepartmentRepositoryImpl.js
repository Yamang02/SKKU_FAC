import { Department, DEFAULT_DEPARTMENTS } from '../data/department.js';

class DepartmentRepositoryImpl {
    constructor() {
        this.departments = new Map(DEFAULT_DEPARTMENTS.map(dept => [dept.id, dept]));
    }

    async findById(id) {
        return this.departments.get(id) || null;
    }

    async findByCode(code) {
        return Array.from(this.departments.values())
            .find(dept => dept.code === code) || null;
    }

    async findAll() {
        return Array.from(this.departments.values());
    }

    async create(departmentData) {
        const newId = Math.max(...Array.from(this.departments.keys())) + 1;
        const department = new Department({
            id: newId,
            ...departmentData
        });
        this.departments.set(department.id, department);
        return department;
    }

    async update(id, departmentData) {
        const department = this.departments.get(id);
        if (!department) {
            return null;
        }

        const updatedDepartment = new Department({
            ...department,
            ...departmentData,
            id,
            updatedAt: new Date()
        });

        this.departments.set(id, updatedDepartment);
        return updatedDepartment;
    }

    async delete(id) {
        return this.departments.delete(id);
    }
}

export default DepartmentRepositoryImpl;
