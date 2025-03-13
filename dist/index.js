import inquirer from 'inquirer';
import { client } from './db/connection.js';
await client.connect();
console.log('Connected to the database');
const askPrompt = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                {
                    name: 'View All Employees',
                    value: 'viewEmployees',
                },
                {
                    name: 'Add Employee',
                    value: 'addEmployee',
                },
                {
                    name: 'Update Employee Role',
                    value: 'updateEmployeeRole',
                },
                {
                    name: 'View All Roles',
                    value: 'viewRoles',
                },
                {
                    name: 'Add Role',
                    value: 'addRole',
                },
                {
                    name: 'View All Departments',
                    value: 'viewDepartments',
                },
                {
                    name: 'Add Department',
                    value: 'addDepartment',
                },
                {
                    name: 'Quit',
                    value: 'quit',
                }
            ]
        },
    ]).then((res) => {
        // console.log(res);
        const choice = res.choice;
        switch (choice) {
            case 'viewEmployees':
                viewEmployees();
                break;
            case 'addEmployee':
                addEmployee();
                break;
            case 'updateEmployeeRole':
                updateEmployeeRole();
                break;
            case 'viewRoles':
                viewRoles();
                break;
            case 'addRole':
                addRole();
                break;
            case 'viewDepartments':
                viewDepartments();
                break;
            case 'addDepartment':
                addDepartment();
                break;
            case 'quit':
                quit();
                break;
            default:
                quit();
                break;
        }
    });
};
const viewEmployees = async () => {
    const rows = await client.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;");
    console.table(rows.rows);
    askPrompt();
};
const addEmployee = async () => {
    inquirer.prompt([
        { type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
        }
    ]).then(async (res) => {
        const firstName = res.firstName;
        const lastName = res.lastName;
        const rows = await client.query('SELECT id, title FROM role');
        const roles = rows.rows.map((role) => {
            return {
                name: role.title,
                value: role.id
            };
        });
        inquirer.prompt({
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: roles
        }).then(async (res) => {
            const roleId = res.role;
            const rows = await client.query('SELECT id, first_name, last_name FROM employee');
            const managers = rows.rows.map((manager) => {
                return {
                    name: `${manager.first_name} ${manager.last_name}`,
                    value: manager.id
                };
            });
            managers.unshift({ name: 'None', value: null });
            inquirer.prompt({
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager?",
                choices: managers
            }).then(async (res) => {
                await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, res.manager]);
                console.log(`Added ${firstName} ${lastName} to the database!`);
                askPrompt();
            });
        });
    });
};
const updateEmployeeRole = async () => {
    const rows = await client.query("SELECT id, first_name, last_name  FROM employee;");
    const employees = rows.rows.map((employee) => {
        return {
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        };
    });
    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: "Which employee's role do you want to update?",
            choices: employees,
        },
    ]).then(async (res) => {
        const employeeId = res.employeeId;
        const rows = await client.query("SELECT id, title FROM role;");
        const roles = rows.rows.map((role) => {
            return {
                name: role.title,
                value: role.id
            };
        });
        inquirer.prompt([
            {
                type: 'list',
                name: 'roleId',
                message: 'Which role do you want to assign the selected employee?',
                choices: roles,
            },
        ]).then(async (res) => {
            await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [res.roleId, employeeId]);
            console.log('Updated employee role');
            askPrompt();
        });
    });
};
const viewRoles = async () => {
    const rows = await client.query("SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;");
    console.table(rows.rows);
    askPrompt();
};
const addRole = async () => {
    const rows = await client.query("SELECT * FROM department;");
    const departments = rows.rows.map((department) => {
        return {
            name: department.name,
            value: department.id
        };
    });
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role?',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role?',
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Which department does the role belong to?',
            choices: departments,
        },
    ]).then(async (res) => {
        await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [res.name, res.salary, res.department_id]);
        console.log(`Added ${res.name} to the database`);
        askPrompt();
    });
};
const viewDepartments = async () => {
    const rows = await client.query("SELECT * FROM department;");
    console.table(rows.rows);
    askPrompt();
};
const addDepartment = async () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?',
        },
    ]).then(async (res) => {
        const name = res.name;
        await client.query('INSERT INTO department (name) VALUES ($1)', [
            name,
        ]);
        console.log(`Added ${name} to the database`);
        askPrompt();
    });
};
const quit = () => {
    console.log('Goodbye!');
    process.exit();
};
askPrompt();
