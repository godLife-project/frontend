import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
  } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  
  export default function TitleSection({ control }) {
    return (
      <FormField
          control={control}
          name="planTitle"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder="나만의 루틴 제목을 입력해주세요" 
                  {...field} 
                  className="text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    );
  }