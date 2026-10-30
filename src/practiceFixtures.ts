import {cases,sampleCase} from './cases.ts';
import {simpleExamples} from './simpleExamples.ts';
import {withDarrenStory} from './darrenStory.ts';
export const practiceFixtures=[...cases.map((_,i)=>sampleCase(i)),...simpleExamples.map(withDarrenStory)];
