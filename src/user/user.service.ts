import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, EditUserDto, EditUserPasswordDTO } from './dtos/';
import { User } from './entities/user.entity'
import { Rol } from './enum';
import { compare } from 'bcrypt';

export interface UserFindOne {
    id?: number;
    email?: string;
}

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>) { }
    async getMany(): Promise<User[]> {
        return await this.userRepository.find({
            where: [
                {
                    roles: Rol.MANAGER
                },
                {
                    roles: Rol.CASHIER
                },
                {
                    roles: Rol.DELIVERY_MAN
                }
            ],
            order: { firstname: "ASC" }
        });
    }
    async getManyByRol(filter:string): Promise<User[]> {
        if(filter === 'all'){
            return await this.userRepository.find({
                where: [
                    {
                        roles: Rol.MANAGER
                    },
                    {
                        roles: Rol.CASHIER
                    },
                    {
                        roles: Rol.DELIVERY_MAN
                    }
                ],
                order: { firstname: "ASC" }
            });
        }
        else{
            return await this.userRepository.find({
                where: [
                    {
                        roles: filter
                    }
                ],
                order: { firstname: "ASC" }
            });
        }
    }
    async getManyClients(): Promise<User[]> {
        return await this.userRepository.find({
            where: [
                {
                    roles: Rol.CLIENT
                },
            ],
            order: { firstname: "ASC" }
        });
    }
    async getOne(id: number, userEntity?: User): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: id } }).then(u => !userEntity ? u : !!userEntity && userEntity.id === u.id ? u : null)
        if (!user) throw new NotFoundException('El usuario no existe o no tienes acceso');
        return user;
    }
    async getOneById(id: number): Promise<User> {
        return await this.userRepository.findOne({ where: { id: id } });
    }
    async findOne(email: string): Promise<User> {
        return await this.userRepository.findOne({ where: { email: email } })
    }
    async findOneByDNI(dni: string): Promise<User> {
        return await this.userRepository.findOne({ where: { dni: dni } })
    }
    async getDeliveryUsers(): Promise<User[]> {
        return await this.userRepository.find({
            where: {
                roles: 'repartidor'
            }
        });
    }
    async edit(id: number, editeduser: EditUserDto, userEntity?: User) {
        const user = await this.getOne(id);
        const dni = await this.findOneByDNI(editeduser.dni);
        if(dni && dni.dni !== user.dni){
            throw new BadRequestException('El DNI ingresado ya se encuentra registrado');
        }
        const editedUser = Object.assign(user, editeduser);
        return await this.userRepository.save(editedUser);
    }
    async editPassword(id: number, newPassword: string) {
        const user = await this.getOne(id);
        user.password = newPassword;
        return await this.userRepository.save(user);
    }
    async updatePassword(id: number, passwords: EditUserPasswordDTO) {
        if(passwords.password !== passwords.password2) throw new BadRequestException('Las contraseñas no coinciden');
        const user = await this.userRepository.findOne({where:{id:id},select:{password:true}});
        if (!user) throw new NotFoundException('El usuario no existe');
        if(!compare(passwords.oldPassword, user.password)) throw new BadRequestException('La contraseña antigua es incorrecta')
        user.password = passwords.password;
        return await this.userRepository.save(user);
    }
    async create(dto: CreateUserDto) {
        const user = this.userRepository.create(dto);
        return await this.userRepository.save(user);
    }
    async delete(id: number) {
        return await this.userRepository.delete(id)
    }
    async findByEmail(data: UserFindOne) {
        return await this.userRepository.createQueryBuilder('user').where({ email: data.email }).addSelect('user.password').getOne();
    }
    async getByEmail(data: UserFindOne) {
        return await this.userRepository.findOne({ where: { email: data.email } })
        //return await this.userRepository.createQueryBuilder('user').where({email:data.email}).addSelect('user.firstname', 'user.lastname').getOne();
    }
    async getCount(): Promise<number> {
        const T: User[] = await this.userRepository.find({
            where: {
                roles: Rol.CLIENT
            }
        });
        return T.length;
    }
}
