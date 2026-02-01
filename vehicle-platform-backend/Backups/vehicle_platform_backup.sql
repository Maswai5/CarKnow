--
-- PostgreSQL database dump
--

\restrict tZ0NSZtaujsiaouWXmMC4YapMwSJ3Nau0LDFyTg1RNqc8ZS7sKnfJoWFuC6J8xD

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accidents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accidents (
    id integer NOT NULL,
    car_id integer,
    accident_date date NOT NULL,
    description text,
    severity character varying(20),
    repaired boolean DEFAULT false
);


ALTER TABLE public.accidents OWNER TO postgres;

--
-- Name: accidents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accidents_id_seq OWNER TO postgres;

--
-- Name: accidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accidents_id_seq OWNED BY public.accidents.id;


--
-- Name: cars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cars (
    id integer NOT NULL,
    vin character varying(50) NOT NULL,
    make character varying(50),
    model character varying(50),
    year integer,
    mileage integer,
    status character varying(20) DEFAULT 'available'::character varying,
    plate character varying(20),
    accident_history text,
    service_records text,
    insurance_status character varying(50),
    valuation numeric,
    last_checked timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    owners_count integer DEFAULT 1
);


ALTER TABLE public.cars OWNER TO postgres;

--
-- Name: cars_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cars_id_seq OWNER TO postgres;

--
-- Name: cars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cars_id_seq OWNED BY public.cars.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    car_id integer,
    service_date date NOT NULL,
    description text,
    service_type character varying(50)
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accidents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accidents ALTER COLUMN id SET DEFAULT nextval('public.accidents_id_seq'::regclass);


--
-- Name: cars id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars ALTER COLUMN id SET DEFAULT nextval('public.cars_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accidents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accidents (id, car_id, accident_date, description, severity, repaired) FROM stdin;
1	1	2018-06-12	Rear bumper damage in minor collision	minor	t
\.


--
-- Data for Name: cars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cars (id, vin, make, model, year, mileage, status, plate, accident_history, service_records, insurance_status, valuation, last_checked, owners_count) FROM stdin;
1	K123ABC	Toyota	Corolla	2015	85000	available	\N	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1
2	K456DEF	Honda	Civic	2018	60000	available	\N	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1
3	K789GHI	Nissan	Sunny	2012	120000	available	\N	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1
4	VIN123456789	Toyota	Corolla	2015	85000	available	KAA123X	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1
5	VIN987654321	Honda	Civic	2018	45000	available	KBB456Y	2021 minor accident, rear bumper replaced	2022 full service, 2023 brake pads replaced	active	1200000	2025-12-15 13:20:18.440717	2
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, car_id, service_date, description, service_type) FROM stdin;
1	1	2021-03-20	Full service including oil change and brake pads	full service
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, role, created_at) FROM stdin;
1	alvin_dev	alvin@example.com	$2b$10$tkQdzUp8Je.Z0c0XRWG7aONC5B7QinB.r3wVJspyC8kn5nNvias92	user	2025-12-15 11:39:38.936102
\.


--
-- Name: accidents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accidents_id_seq', 1, true);


--
-- Name: cars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cars_id_seq', 5, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: accidents accidents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accidents
    ADD CONSTRAINT accidents_pkey PRIMARY KEY (id);


--
-- Name: cars cars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_pkey PRIMARY KEY (id);


--
-- Name: cars cars_plate_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_plate_key UNIQUE (plate);


--
-- Name: cars cars_vin_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_vin_key UNIQUE (vin);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: accidents accidents_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accidents
    ADD CONSTRAINT accidents_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- Name: services services_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict tZ0NSZtaujsiaouWXmMC4YapMwSJ3Nau0LDFyTg1RNqc8ZS7sKnfJoWFuC6J8xD

