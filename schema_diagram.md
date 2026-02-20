# hrbs documentation
## Summary

- [Introduction](#introduction)
- [Database Type](#database-type)
- [Table Structure](#table-structure)
	- [users](#users)
	- [hotels](#hotels)
	- [users_to_hotels](#users_to_hotels)
	- [rooms](#rooms)
	- [hosts](#hosts)
- [Relationships](#relationships)
- [Database Diagram](#database-diagram)

## Introduction

## Database type

- **Database system:** PostgreSQL
## Table structure

### users

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **id** | TEXT | 🔑 PK, not null, unique | fk_users_id_users_to_hostels,fk_users_id_hosts | |
| **name** | VARCHAR(255) | not null |  | |
| **is_host** | BOOLEAN | not null, default: FALSE |  | |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 


### hotels

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **id** | UUID | 🔑 PK, not null, unique | fk_hotels_id_users_to_hostels | |
| **name** | VARCHAR(255) | not null |  | |
| **state** | STATE | not null |  | |
| **host_id** | UUID | not null | fk_hotels_host_id_hosts | |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 


### users_to_hotels

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **user_id** | TEXT | 🔑 PK, not null, unique |  | |
| **hotel_id** | UUID | 🔑 PK, not null |  | |
| **room_id** | UUID | not null |  | |
| **check_in** | DATE | null |  | |
| **check_out** | DATE | null |  | |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 


### rooms

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **id** | UUID | 🔑 PK, not null, unique | fk_rooms_id_users_to_hostels | |
| **name ** | TEXT | not null |  | |
| **hotel_id** | UUID | not null | fk_rooms_hotel_id_hotels | |
| **price_in_inr** | INTEGER | not null |  | |
| **is_reserved** | BOOLEAN | not null, default: FALSE |  | |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 


### hosts

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **id** | UUID | 🔑 PK, not null, unique |  | |
| **user_id** | TEXT | not null |  | |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 


## Relationships

- **users to users_to_hotels**: one_to_one
- **hotels to users_to_hotels**: one_to_one
- **rooms to users_to_hotels**: one_to_one
- **rooms to hotels**: many_to_one
- **users to hosts**: one_to_one
- **hotels to hosts**: many_to_one

## Database Diagram

```mermaid
erDiagram
	users ||--|| users_to_hotels : references
	hotels ||--|| users_to_hotels : references
	rooms ||--|| users_to_hotels : references
	rooms }o--|| hotels : references
	users ||--|| hosts : references
	hotels }o--|| hosts : references

	users {
		TEXT id
		VARCHAR(255) name
		BOOLEAN is_host
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	hotels {
		UUID id
		VARCHAR(255) name
		STATE state
		UUID host_id
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	users_to_hotels {
		TEXT user_id
		UUID hotel_id
		UUID room_id
		DATE check_in
		DATE check_out
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	rooms {
		UUID id
		TEXT name 
		UUID hotel_id
		INTEGER price_in_inr
		BOOLEAN is_reserved
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	hosts {
		UUID id
		TEXT user_id
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}
```