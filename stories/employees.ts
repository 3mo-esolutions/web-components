/** A small company as an org chart: each employee with the people reporting to them. */
export type Employee = { id: number, name: string, city: string, age: number, role: string, email: string, reports?: Array<Employee> }

const employee = (id: number, name: string, city: string, age: number, role: string, reports?: Array<Employee>): Employee =>
	({ id, name, city, age, role, email: `${name.split(' ')[0]!.toLowerCase()}@example.com`, reports })

export const roles = ['Head of Operations', 'Team Lead', 'Engineer', 'Trainee', 'Security', 'Analyst', 'Courier', 'Photographer', 'Designer']

export const employees: Array<Employee> = [
	employee(1, 'Octavia Blake', 'Berlin', 41, 'Head of Operations', [
		employee(11, 'Clarke Griffin', 'Berlin', 32, 'Team Lead', [
			employee(111, 'Wells Jaha', 'Berlin', 27, 'Engineer'),
			employee(112, 'Jasper Jordan', 'Potsdam', 25, 'Trainee'),
		]),
		employee(12, 'Raven Reyes', 'Hamburg', 29, 'Engineer', [employee(121, 'Monty Green', 'Hamburg', 24, 'Trainee')]),
	]),
	employee(2, 'Elliot Alderson', 'Paris', 35, 'Security', [
		employee(21, 'Darlene Alderson', 'Paris', 31, 'Analyst'),
		employee(22, 'Angela Moss', 'Lyon', 33, 'Analyst'),
	]),
	employee(3, 'Arya Stark', 'London', 22, 'Courier'),
	employee(4, 'Max Caulfield', 'Paris', 19, 'Photographer'),
	employee(5, 'Chloe Price', 'Madrid', 20, 'Designer'),
	employee(6, 'Brienne Tarth', 'Dublin', 38, 'Security'),
]
