#!/bin/sh

# Description:
#     Command to create a storybook from component names.
#
# Usage:
#     $ source story_book_creator.sh <component_name> [options]
#
# Options:
#     -a, --atoms: atoms
#     -m, --molecules: molecules
#     -o, --organisms: organisms
#     -t, --templates: templates
#     -p, --pages: pages
#     -c, --custom <custom_name>: custom
#
# Examples:
#     $ source story_book_creator.sh YourComponent -a
#     $ source story_book_creator.sh YourComponent -c customComponentUnit

template="import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Meta, Story } from '@storybook/react';

import {{componentName}} from './{{componentName}}';

export default {
    title: '{{unitName}}/{{componentName}}',
    component: {{componentName}},
} as Meta;

const Template: Story<typeof {{componentName}}> = (args) => {
  return (
    <Router>
      <{{componentName}} {...args}>
        <div />
      </{{componentName}}>
    </Router>
  );
};

export const Primary: Template = Template.bind({});
// Primary.args = {};"

unitName=""
projectType="tsx"
componentName="$1"

# processing option
while [ $# -gt 0 ]; do
    case "$2" in
        -a|--atoms)
            unitName="atoms"
            shift
            ;;
        -m|--molecules)
            unitName="molecules"
            shift
            ;;
        -o|--organisms)
            unitName="organisms"
            shift
            ;;
        -t|--templates)
            unitName="templates"
            shift
            ;;
        -p|--pages)
            unitName="pages"
            shift
            ;;
        -c|--custom)
            shift
            unitName="$2"
            ;;
        *)
            break
            ;;
    esac
done

echo "$template" \
 | sed "s/{{unitName}}/$unitName/g" \
 | sed "s/{{componentName}}/$componentName/g" \
 > "./$componentName.stories.$projectType"
