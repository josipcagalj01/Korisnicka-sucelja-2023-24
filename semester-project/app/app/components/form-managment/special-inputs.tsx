'use client'

import { Control, Controller } from "react-hook-form"
import {Form, Field} from "../../../lib/configureFormLib"

export interface NumberRadioInputProps {
	control: Control<Form>,
	name:any,
	number_value: number,
	onClick?: React.MouseEventHandler<HTMLInputElement>
}

export function RadioNumberInput ({control, name, number_value, onClick}: NumberRadioInputProps) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, onBlur, value, ref } }) => (
				<input
					type="radio"
					onBlur={onBlur} // notify when input is touched
					onChange={() => onChange(number_value)} // send value to hook form
					ref={ref}
					checked={value===number_value}
					onClick={onClick}
				/>
			)}
		/>
	)
}

export function RadioNumberInput2 ({control, name, number_value, onClick}: Omit<NumberRadioInputProps, 'control'> & {control: Control<{template_id?: number, use_template: boolean}>}) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, onBlur, value, ref } }) => (
				<input
					type="radio"
					onBlur={onBlur} // notify when input is touched
					onChange={() => onChange(number_value)} // send value to hook form
					ref={ref}
					checked={value===number_value}
					onClick={onClick}
				/>
			)}
		/>
	)
}

export interface booleanInputProps {
	control: Control<Form>,
	name:any,
	trueText?: string,
	falseText?: string,
	disableTrue?: boolean,
	disableFalse?: boolean,
	reversed?: boolean,
	onClickTrue?: React.MouseEventHandler<HTMLInputElement>
	onClickFalse?: React.MouseEventHandler<HTMLInputElement>
}

export function MyBooleanInput({ control, name, trueText, falseText, disableTrue, disableFalse, reversed=false, onClickFalse, onClickTrue }: booleanInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <div>
          <span className={reversed ? (disableFalse ? 'disabled' : '') : (disableTrue ? 'disabled' : '')}>
            <input
              type="radio"
              onBlur={onBlur} // notify when input is touched
              onChange={() => onChange(!reversed)} // send value to hook form
              checked={value === !reversed}
              ref={ref}
							onClick={reversed ? onClickFalse : onClickTrue}
            />
						<p>{reversed ? (falseText || 'Ne') : (trueText || 'Da')}</p>
          </span>
          <span className={reversed ? (disableTrue ? 'disabled' : '') : (disableFalse ? 'disabled' : '')}>
            <input
              type="radio"
              onBlur={onBlur} // notify when input is touched
              onChange={() => onChange(reversed)} // send value to hook form
              checked={value === reversed}
              ref={ref}
							onClick={reversed ? onClickTrue : onClickFalse}
            />
						<p>{reversed ? (trueText || 'Da') : (falseText || 'Ne')}</p>
          </span>
        </div>
      )}
    />
  );
}

export function MyBooleanInput2({ control, name, trueText, falseText, disableTrue, disableFalse, reversed=false, onClickFalse, onClickTrue }: Omit<booleanInputProps , 'control'> & {control: Control<{template_id?: number, use_template: boolean}>}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <div>
          <span className={reversed ? (disableFalse ? 'disabled' : '') : (disableTrue ? 'disabled' : '')}>
            <input
              type="radio"
              onBlur={onBlur} // notify when input is touched
              onChange={() => onChange(!reversed)} // send value to hook form
              checked={value === !reversed}
              ref={ref}
							onClick={reversed ? onClickFalse : onClickTrue}
            />
						<p>{reversed ? (falseText || 'Ne') : (trueText || 'Da')}</p>
          </span>
          <span className={reversed ? (disableTrue ? 'disabled' : '') : (disableFalse ? 'disabled' : '')}>
            <input
              type="radio"
              onBlur={onBlur} // notify when input is touched
              onChange={() => onChange(reversed)} // send value to hook form
              checked={value === reversed}
              ref={ref}
							onClick={reversed ? onClickTrue : onClickFalse}
            />
						<p>{reversed ? (trueText || 'Da') : (falseText || 'Ne')}</p>
          </span>
        </div>
      )}
    />
  );
}