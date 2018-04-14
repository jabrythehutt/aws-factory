# AWS launcher

## What?
This projects contains some utilities for instantiating AWS classes in a Node/browser environment after the user is authenticated.

## Why?
Many of the projects I was working on involved a step requiring a user to authenticate prior to accessing AWS resources. I found that writing a centralised utility for instantiating the various different AWS classes after loading the required credentials simplified other dependent parts of my applications.

## How?
